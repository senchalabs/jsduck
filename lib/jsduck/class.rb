module JsDuck

  # Encapsulates class documentation and provides some commonly needed
  # methods on it.  Otherwise it acts like Hash, providing the []
  # method.
  class Class
    def initialize(doc, classes={})
      @doc = doc
      @classes = classes
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

    # Looks up class object by name
    # When not found, prints warning message.
    def lookup(classname)
      if @classes[classname]
        @classes[classname]
      elsif classname != "Object"
        puts "Warning: Class #{classname} not found in #{@doc[:filename]} line #{@doc[:linenr]}"
      end
    end

    # Returns all data in Class object as hash.  This is basically the
    # same as just accessing @doc, except instead of :cfg field there
    # is :cfgs which also contains the inherited ones.  Same for
    # :properties, :methods, and :events.
    def to_hash
      doc = @doc.clone
      doc[:cfgs] = members(:cfg)
      doc[:properties] = members(:property)
      doc[:methods] = members(:method)
      doc[:events] = members(:event)
      doc.delete(:cfg)
      doc.delete(:property)
      doc.delete(:method)
      doc.delete(:event)
      doc[:component] = inherits_from?("Ext.Component")
      doc[:superclasses] = superclasses.collect {|cls| cls.full_name }
      doc
    end

    # Returns true when this class inherits from the specified class.
    # Also returns true when the class itself is the one we are asking about.
    def inherits_from?(class_name)
      return full_name == class_name || (parent ? parent.inherits_from?(class_name) : false)
    end

    # Returns array of all public members of particular type in a class,
    # sorted by name.
    #
    # For methods the the constructor is listed as first method having
    # the same name as class itself.
    #
    # See members_hash for details.
    def members(type)
      ms = members_hash(type).values.sort {|a,b| a[:name] <=> b[:name] }
      type == :method ? constructor_first(ms) : ms
    end

    # If methods list contains constructor, rename it with class name
    # and move into beginning of methods list.
    def constructor_first(ms)
      constr = ms.find {|m| m[:name] == "constructor" }
      if constr
        ms.delete(constr)
        # Clone it.  Otherwise the search for "constructor" from this
        # class will return nothing as we have renamed it.
        constr2 = constr.clone
        constr2[:name] = short_name
        ms.unshift(constr2)
      end
      ms
    end

    # Returns hash of public members of class (and of parent classes
    # and mixin classes).  Members are methods, properties, cfgs,
    # events (member type is specified through 'type' parameter).
    #
    # When parent and child have members with same name,
    # member from child overrides tha parent member.
    #
    # We also set :member property to each member to the full class
    # name where it belongs, so one can tell them apart afterwards.
    def members_hash(type)
      all_members = parent ? parent.members_hash(type) : {}

      mixins.each do |mix|
        all_members.merge!(mix.members_hash(type))
      end

      @doc[type].each do |m|
        all_members[m[:name]] = m if !m[:private]
      end

      all_members
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
  end

end
