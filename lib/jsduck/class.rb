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
      @doc[:extends] ? @classes[@doc[:extends]] : nil
    end

    # Returns true when this class inherits from the specified class.
    # Also returns true when the class itself is the one we are asking about.
    def inherits_from?(class_name)
      return full_name == class_name || (parent ? parent.inherits_from?(class_name) : false)
    end

    # Returns array of all members of particular type in a class,
    # sorted by name.  See members_hash for details.
    def members(type)
      members_hash(type).values.sort {|a,b| a[:name] <=> b[:name] }
    end

    # Returns hash of members of class (and parent classes).
    # Members are methods, properties, cfgs, events (member type
    # is speified through 'type' parameter).
    #
    # When parent and child have members with same name,
    # member from child overrides tha parent member.
    #
    # We also set :member property to each member to the full class
    # name where it belongs, so one can tell them apart afterwards.
    def members_hash(type)
      parent_members = parent ? parent.members_hash(type) : {}
      @doc[type].each do |m|
        m[:member] = full_name
        parent_members[m[:name]] = m
      end
      parent_members
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
      parts = name.split(/\./)
      parts.slice(0, parts.length - 1).join(".")
    end

    # Utility method that given full package or class name extracts
    # the last part of the name.
    def self.short_name(name)
      name.split(/\./).last
    end
  end

end
