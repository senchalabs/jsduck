require 'jsduck/logger'
require 'pp'

module JsDuck

  # Deals with inheriting documentation
  class InheritDoc
    def initialize(relations)
      @relations = relations
    end

    # Performs all inheriting
    def resolve_all
      @relations.each do |cls|
        resolve_class(cls) if cls[:inheritdoc]
        cls.all_local_members.each do |member|
          if member[:inheritdoc]
            resolve(member)
          end
        end
      end
    end

    # Copy over doc/params/return from parent member.
    def resolve(m)
      parent = find_parent(m)
      m[:doc] = (m[:doc] + "\n\n" + parent[:doc]).strip
      m[:params] = parent[:params] if parent[:params]
      m[:return] = parent[:return] if parent[:return]
    end

    # Finds parent member of the given member.  When @inheritdoc names
    # a member to inherit from, finds that member instead.
    #
    # If the parent also has @inheritdoc, continues recursively.
    def find_parent(m)
      context = m[:files][0]
      inherit = m[:inheritdoc]

      if inherit[:cls]
        # @inheritdoc MyClass#member
        parent_cls = @relations[inherit[:cls]]
        unless parent_cls
          warn("@inheritdoc #{inherit[:cls]}##{inherit[:member]} - class not found", context)
          return m
        end
        parent = lookup_member(parent_cls, m)
        unless parent
          warn("@inheritdoc #{inherit[:cls]}##{inherit[:member]} - member not found", context)
          return m
        end
      elsif inherit[:member]
        # @inheritdoc #member
        parent = lookup_member(@relations[m[:owner]], m)
        unless parent
          warn("@inheritdoc ##{inherit[:member]} - member not found", context)
          return m
        end
      else
        # @inheritdoc
        parent_cls = @relations[m[:owner]].parent
        mixins = @relations[m[:owner]].mixins
        # Warn when no parent or mixins at all
        if !parent_cls && mixins.length == 0
          warn("@inheritdoc - parent class not found", context)
          return m
        end
        # First check for the member in all mixins, because members
        # from mixins override those from parent class.  Looking first
        # from mixins is probably a bit slower, but it's the correct
        # order to do things.
        if mixins.length > 0
          parent = mixins.map {|mix| lookup_member(mix, m) }.compact.first
        end
        # When not found, try looking from parent class
        if !parent && parent_cls
          parent = lookup_member(parent_cls, m)
        end
        # Only when both parent and mixins fail, throw warning
        if !parent
          warn("@inheritdoc - parent member not found", context)
          return m
        end
      end

      if parent[:inheritdoc]
        find_parent(parent)
      else
        parent
      end
    end

    def lookup_member(cls, m)
      inherit = m[:inheritdoc]
      cls.get_members(inherit[:member] || m[:name], inherit[:type] || m[:tagname], inherit[:static] || m[:meta][:static])[0]
    end

    # Copy over doc from parent class.
    def resolve_class(cls)
      parent = find_class_parent(cls)
      cls[:doc] = (cls[:doc] + "\n\n" + parent[:doc]).strip
    end

    def find_class_parent(cls)
      context = cls[:files][0]
      inherit = cls[:inheritdoc]

      if inherit[:cls]
        # @inheritdoc MyClass
        parent = @relations[inherit[:cls]]
        unless parent
          warn("@inheritdoc #{inherit[:cls]} - class not found", context)
          return cls
        end
      else
        # @inheritdoc
        parent = cls.parent
        if !parent
          warn("@inheritdoc - parent class not found", context)
          return cls
        end
      end

      if parent[:inheritdoc]
        find_class_parent(parent)
      else
        parent
      end
    end

    def warn(msg, context)
      Logger.instance.warn(:inheritdoc, msg, context[:filename], context[:linenr])
    end

  end

end
