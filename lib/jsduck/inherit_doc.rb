require 'jsduck/logger'

module JsDuck

  # Deals with inheriting documentation
  class InheritDoc
    def initialize(relations)
      @relations = relations
    end

    # Performs all inheriting
    def resolve_all
      @relations.each do |cls|
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
        parent_cls = @relations[inherit[:cls]]
        unless parent_cls
          warn("@inheritdoc #{inherit[:cls]}##{inherit[:member]} - class not found", context)
          return m
        end
        parent = parent_cls.get_member(inherit[:member], inherit[:type] || m[:tagname])
        unless parent
          warn("@inheritdoc #{inherit[:cls]}##{inherit[:member]} - member not found", context)
          return m
        end
      else
        parent_cls = @relations[m[:owner]].parent
        unless parent_cls
          warn("@inheritdoc - parent class not found", context)
          return m
        end
        parent = parent_cls.get_member(m[:name], m[:tagname])
        unless parent
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

    def warn(msg, context)
      Logger.instance.warn(:inheritdoc, msg, context[:filename], context[:linenr])
    end

  end

end
