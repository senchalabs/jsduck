require 'jsduck/logger'
require 'jsduck/class'

module JsDuck
  module Process

    # Deals with inheriting member documentation.
    class InheritMembers
      def initialize(relations)
        @relations = relations
      end

      # Inherits docs for all members in class.
      #
      # In case of members with explicit @inheritdoc tags we inherit
      # the following fields when they're not empty in current member:
      #
      # - :doc
      # - :params
      # - :return
      # - :throws
      #
      # In case of auto-detected members that inherit from a public
      # member in parent class, we inherit all fields that aren't
      # present in current member, plus the :type field.
      #
      # Auto-detected members inheriting from other private
      # auto-detected members follow the same rules of inheritance as
      # members with explicit @inheritdoc.
      #
      # Additionally auto-detected properties get turned into configs
      # when a public configs with same name is detected in parent
      # class.
      #
      def resolve(cls)
        new_cfgs = []

        cls.all_local_members.each do |member|
          if member[:inheritdoc]
            resolve_member(cls, member, new_cfgs)
          end
        end

        move_cfgs(cls, new_cfgs) if new_cfgs.length > 0
      end

      private

      def resolve_member(cls, m, new_cfgs)
        parent = find_parent(m)
        if parent && parent[:inheritdoc]
          resolve_parent(cls, parent)
        end

        if m[:inheritdoc] && parent
          if autodetected?(m) && !parent[:private]
            auto_inherit(m, parent)
          else
            inherit(m, parent)
          end

          # remember properties that have changed to configs
          if autodetected?(m) && m[:tagname] != parent[:tagname]
            new_cfgs << m
          end
        end

        resolve_visibility(m, parent)

        m[:inheritdoc] = nil
      end

      def resolve_parent(cls, parent)
        new_cfgs = []
        resolve_member(cls, parent, new_cfgs)
        move_cfgs(cls, new_cfgs) if new_cfgs.length > 0
      end

      def inherit(m, parent)
        m[:doc] = parent[:doc] if m[:doc].empty?

        # Don't inherit params from parent when:
        # - member itself has params and these are not auto-detected
        # - or the params in parent are auto-detected.
        unless m[:params] && m[:params].length > 0 && !auto?(m, :params) || auto?(parent, :params)
          m[:params] = parent[:params]
        end

        m[:return] = parent[:return] unless m[:return]
        m[:throws] = parent[:throws] unless m[:throws] && m[:throws].length > 0

        # Don't inherit type from parent when:
        # - member itself has type and it's not auto-detected
        # - or the type in parent is auto-detected.
        unless m[:type] && m[:type] != "Object" && !auto?(m, :type) || auto?(parent, :type)
          m[:type] = parent[:type]
        end
      end

      def auto_inherit(m, parent)
        m[:doc] = parent[:doc] if m[:doc].empty?

        parent.each_pair do |key, value|
          if key == :type || !m[key]
            m[key] = value
          end
        end
      end

      # True when specific field of member has been auto-detected
      def auto?(m, key)
        m[:autodetected] && m[:autodetected][key]
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
        if autodetected?(m) && !JsDuck::Class.constructor?(m)
          if !parent || parent[:private]
            m[:private] = true
          end

          m[:protected] = true if parent && parent[:protected]
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
            warn("parent class not found", m) unless autodetected?(m)
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
            warn("parent member not found", m) unless autodetected?(m)
            return nil
          end
        end

        return parent
      end

      def lookup_member(cls, m)
        inherit = m[:inheritdoc] || {}
        name = inherit[:member] || m[:name]
        tagname = inherit[:type] || m[:tagname]
        # When not explicitly inheriting from static member
        # and the member itself is not static,
        # inherit from instance member.
        static = inherit[:static] || m[:static] || false

        if autodetected?(m)
          # Auto-detected properties can override either a property or a
          # config. So look for both types.
          if tagname == :property
            cfg = cls.find_members(:name => name, :tagname => :cfg, :static => static)[0]
            prop = cls.find_members(:name => name, :tagname => :property, :static => static)[0]

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
            cls.find_members(:name => name, :tagname => tagname, :static => static)[0]
          end
        else
          m = cls.find_members(:name => name, :tagname => tagname, :static => static)[0]
          # When member was not found with explicit staticality and
          # the @inheritdoc tag contained no explicit "static", then
          # look for both static and instance members.
          if !m && !inherit[:static]
            m = cls.find_members(:name => name, :tagname => tagname, :static => nil)[0]
          end
          m
        end
      end

      # True when the entire member was auto-detected
      def autodetected?(m)
        m[:autodetected] && m[:autodetected][:tagname]
      end

      def warn(msg, m)
        inh_member = m[:inheritdoc][:member]
        inh_target = (m[:inheritdoc][:cls] || "") + (inh_member ? "#" + inh_member : "")

        Logger.warn(:inheritdoc, "@inheritdoc #{inh_target} - #{msg}", m[:files][0])

        return nil
      end

    end

  end
end
