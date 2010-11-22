module JsDuck

  # Encapsulates class documentation and provides some commonly needed
  # methods on it.  Otherwise it acts like Hash, providing the []
  # method.
  class Class
    def initialize(doc)
      @doc = doc
    end

    def [](key)
      @doc[key]
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
