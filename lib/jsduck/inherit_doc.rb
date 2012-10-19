require 'jsduck/logger'
require 'jsduck/class'

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

        new_cfgs = []
        cls.all_local_members.each do |member|
          if member[:inheritdoc]
            resolve(member, new_cfgs)
          end
        end
        move_cfgs(cls, new_cfgs) if new_cfgs.length > 0
      end
    end

    private

    # Copy over doc/params/return from parent member.
    def resolve(m, new_cfgs)
      parent = find_parent(m)

      if m[:inheritdoc] && parent
        m[:doc] = (m[:doc] + "\n\n" + parent[:doc]).strip
        m[:params] = parent[:params] if parent[:params]
        m[:return] = parent[:return] if parent[:return]
        m[:type] = parent[:type] if parent[:type]

        if m[:autodetected]
          m[:meta] = parent[:meta].merge(m[:meta])
        end

        # remember properties that have changed to configs
        if m[:autodetected] && m[:tagname] != parent[:tagname]
          new_cfgs << m
        end
      end

      resolve_visibility(m, parent)
    end

    # Changes given properties into configs within class
    def move_cfgs(cls, members)
      members.each do |m|
        m[:tagname] = :cfg
      end
      # Ask class to update its internal caches for these members
      cls.update_members!(members)
    end

    # For auto-detected members/classes (which have @private == :inherit)
    # Use the visibility from parent class (defaulting to private when no parent).
    def resolve_visibility(m, parent)
      if m[:autodetected] && !JsDuck::Class.constructor?(m)
        if !parent || parent[:private]
          m[:meta][:private] = m[:private] = true
        end
      end
    end

    # Finds parent member of the given member.  When @inheritdoc names
    # a member to inherit from, finds that member instead.
    #
    # If the parent also has @inheritdoc, continues recursively.
    def find_parent(m)

      inherit = m[:inheritdoc] || {}
      if inherit[:cls]
        # @inheritdoc MyClass#member
        parent_cls = @relations[m[:inheritdoc][:cls]]
        return warn("class not found", m) unless parent_cls

        parent = lookup_member(parent_cls, m)
        return warn("member not found", m) unless parent

      elsif inherit[:member]
        # @inheritdoc #member
        parent = lookup_member(@relations[m[:owner]], m)
        return warn("member not found", m) unless parent

      else
        # @inheritdoc
        parent_cls = @relations[m[:owner]].parent
        mixins = @relations[m[:owner]].mixins

        # Warn when no parent or mixins at all
        if !parent_cls && mixins.length == 0
          warn("parent class not found", m) unless m[:autodetected]
          return nil
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
          warn("parent member not found", m) unless m[:autodetected]
          return nil
        end
      end

      return parent[:inheritdoc] ? find_parent(parent) : parent
    end

    def lookup_member(cls, m)
      inherit = m[:inheritdoc] || {}
      name = inherit[:member] || m[:name]
      tagname = inherit[:type] || m[:tagname]
      static = inherit[:static] || m[:meta][:static]

      if m[:autodetected]
        # Auto-detected properties can override either a property or a
        # config. So look for both types.
        if tagname == :property
          cfg = cls.find_members(:name => name, :tagname => :cfg, :static => static || false)[0]
          prop = cls.find_members(:name => name, :tagname => :property, :static => static || false)[0]

          if cfg && prop
            prop
          elsif cfg
            cfg
          elsif prop
            prop
          else
            nil
          end

        else
          # Unless the auto-detected member is detected as static,
          # look only at instance members.
          cls.find_members(:name => name, :tagname => tagname, :static => static || false)[0]
        end
      else
        cls.find_members(:name => name, :tagname => tagname, :static => static)[0]
      end
    end

    # Copy over doc from parent class.
    def resolve_class(cls)
      parent = find_class_parent(cls)

      if parent
        cls[:doc] = (cls[:doc] + "\n\n" + parent[:doc]).strip
      end
    end

    def find_class_parent(cls)
      if cls[:inheritdoc][:cls]
        # @inheritdoc MyClass
        parent = @relations[cls[:inheritdoc][:cls]]
        return warn("class not found", cls) unless parent
      else
        # @inheritdoc
        parent = cls.parent
        return warn("parent class not found", cls) unless parent
      end

      return parent[:inheritdoc] ? find_class_parent(parent) : parent
    end

    def warn(msg, item)
      context = item[:files][0]
      i_member = item[:inheritdoc][:member]

      msg = "@inheritdoc #{item[:inheritdoc][:cls]}"+ (i_member ? "#" + i_member : "") + " - " + msg
      Logger.warn(:inheritdoc, msg, context[:filename], context[:linenr])

      return nil
    end

  end

end
