require 'jsduck/logger'

module JsDuck

  # Encapsulates class documentation and provides some commonly needed
  # methods on it.  Otherwise it acts like Hash, providing the []
  # method.
  class Class
    attr_accessor :relations

    def initialize(doc)
      @doc = doc
      @doc[:members] = Class.default_members_hash if !@doc[:members]
      @doc[:statics] = Class.default_members_hash if !@doc[:statics]
      @relations = nil
    end

    def [](key)
      @doc[key]
    end

    # Returns instance of parent class, or nil if there is none
    def parent
      @doc[:extends] ? lookup(@doc[:extends]) : nil
    end

    # Returns array of ancestor classes.
    # Example result when asking ancestors of MyPanel might be:
    #
    #   [Ext.util.Observable, Ext.Component, Ext.Panel]
    #
    def superclasses
      p = parent
      p ? p.superclasses + [p]  : []
    end

    # Returns array of mixin class instances.
    # Returns empty array if no mixins
    def mixins
      @doc[:mixins] ? @doc[:mixins].collect {|classname| lookup(classname) }.compact : []
    end

    # Returns all mixins this class and its parent classes
    def all_mixins
      mixins + (parent ? parent.all_mixins : [])
    end

    # Looks up class object by name
    # When not found, prints warning message.
    def lookup(classname)
      if @relations[classname]
        @relations[classname]
      elsif !@relations.ignore?(classname)
        Logger.instance.warn("Class #{classname} not found in #{@doc[:filename]} line #{@doc[:linenr]}")
        nil
      end
    end

    # Returns copy of @doc hash
    def to_hash
      @doc.clone
    end

    def to_json(*a)
      to_hash.to_json(*a)
    end

    # Returns true when this class inherits from the specified class.
    # Also returns true when the class itself is the one we are asking about.
    def inherits_from?(class_name)
      return full_name == class_name || (parent ? parent.inherits_from?(class_name) : false)
    end

    # Returns array of all public members of particular type in a class,
    # sorted by name.
    #
    # For methods the the constructor is listed first.
    #
    # See members_hash for details.
    def members(type, context=:members)
      ms = members_hash(type, context).values.sort {|a,b| a[:name] <=> b[:name] }
      type == :method ? constructor_first(ms) : ms
    end

    # If methods list contains constructor, rename it with class name
    # and move into beginning of methods list.
    def constructor_first(ms)
      constr = ms.find {|m| m[:name] == "constructor" }
      if constr
        ms.delete(constr)
        ms.unshift(constr)
      end
      ms
    end

    # Returns hash of public members of class (and of parent classes
    # and mixin classes).  Members are methods, properties, cfgs,
    # events (member type is specified through 'type' parameter).
    #
    # When parent and child have members with same name,
    # member from child overrides tha parent member.
    def members_hash(type, context=:members)
      # Singletons have no static members
      if @doc[:singleton] && context == :statics
        # Warn if singleton has static members
        if @doc[context][type].length > 0
          Logger.instance.warn("Singleton class #{@doc[:name]} can't have static members, remove the @static tag.")
        end
        return {}
      end

      all_members = parent ? parent.members_hash(type, context) : {}

      mixins.each do |mix|
        all_members.merge!(mix.members_hash(type, context))
      end

      # For static members, exclude everything not explicitly marked as inheritable
      if context == :statics
        all_members.delete_if {|key, member| !member[:inheritable] }
      end

      all_members.merge!(local_members_hash(type, context))

      # If singleton has static members, include them as if they were
      # instance members.  Otherwise they will be completely excluded
      # from the docs, as the static members block is not created for
      # singletons.
      if @doc[:singleton] && @doc[:statics][type].length > 0
        all_members.merge!(local_members_hash(type, :statics))
      end

      all_members
    end

    # Helper method to get the direct members of this class
    def local_members_hash(type, context)
      local_members = {}
      (@doc[context][type] || []).each do |m|
        local_members[m[:name]] = m if !m[:private]
      end
      local_members
    end

    # Returns member by name.
    #
    # Optionally one can also specify type name to differenciate
    # between different types of members.
    def get_member(name, type_name=nil)
      # build hash of all members
      unless @members_map
        @members_map = {}
        [:members, :statics].each do |group|
          @doc[group].each_key do |type|
            members_hash(type, group).each_pair do |key, member|
              @members_map["#{type}-#{key}"] = member
              @members_map[key] = member
            end
          end
        end
      end

      @members_map[type_name ? "#{type_name}-#{name}" : name]
    end

    # Loops through each member of the class, invoking block with each of them
    def each_member(&block)
      [:members, :statics].each do |group|
        @doc[group].each_value do |members|
          members.each(&block)
        end
      end
    end

    # A way to access full class name with similar syntax to
    # package_name and short_name
    def full_name
      @doc[:name]
    end

    # Returns package name of the class.
    #
    # That is the namespace part of full class name.
    #
    # For example "My.package" is package_name of "My.package.Class"
    def package_name
      Class.package_name(@doc[:name])
    end

    # Returns last part of full class name
    #
    # For example for "My.package.Class" it is "Class"
    def short_name
      Class.short_name(@doc[:name])
    end

    # Static methods

    # Utility method that given a package or class name finds the name
    # of its parent package.
    def self.package_name(name)
      name.slice(0, name.length - self.short_name(name).length - 1) || ""
    end

    # Utility method that given full package or class name extracts
    # the "class"-part of the name.
    #
    # Because we try to emulate ext-doc, it's not as simple as just
    # taking the last part.  See class_spec.rb for details.
    def self.short_name(name)
      parts = name.split(/\./)
      short = parts.pop
      while parts.length > 1 && parts.last =~ /^[A-Z]/
        short = parts.pop + "." + short
      end
      short
    end

    # Returns default hash that has empty array for each member type
    def self.default_members_hash
      return {
        :cfg => [],
        :property => [],
        :method => [],
        :event => [],
        :css_var => [],
        :css_mixin => [],
      }
    end
  end

end
