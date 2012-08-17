require 'jsduck/logger'

module JsDuck

  # Encapsulates class documentation and provides some commonly needed
  # methods on it.  Otherwise it acts like Hash, providing the []
  # method.
  class Class
    attr_accessor :relations

    # Creates JSDuck class.
    #
    # Pass true as second parameter to create a placeholder class.
    def initialize(doc, class_exists=true)
      @doc = doc

      # Wrap classname into custom string class that allows
      # differenciating between existing and missing classes.
      @doc[:name] = ClassNameString.new(@doc[:name], class_exists)

      @doc[:members] = [] if !@doc[:members]

      @relations = nil
    end

    # Accessors for internal doc object.  These are used to run
    # ClassFormatter on the internal doc object and then assign it
    # back.
    def internal_doc
      @doc
    end
    def internal_doc=(doc)
      @doc = doc
    end

    # Accessor to internal hash
    def [](key)
      @doc[key]
    end

    # Assignment to internal hash keys
    def []=(key, value)
      @doc[key] = value
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

    # Returns all direct mixins of this class. Same as #deps(:mixins).
    def mixins
      deps(:mixins)
    end

    # Returns an array of class instances this class directly depends on.
    # Possible types are:
    #
    # - :mixins
    # - :requires
    # - :uses
    #
    def deps(type)
      @doc[type] ? @doc[type].collect {|classname| lookup(classname) } : []
    end

    # Same ase #deps, but pulls out the dependencies from all parent classes.
    def parent_deps(type)
      parent ? parent.deps(type) + parent.parent_deps(type) : []
    end

    # Looks up class object by name
    # When not found, prints warning message.
    def lookup(classname)
      if @relations[classname]
        @relations[classname]
      elsif @relations.ignore?(classname) || classname =~ /\*/
        # Ignore explicitly ignored classes and classnames with
        # wildcards in them.  We could expand the wildcard, but that
        # can result in a very long list of classes, like when
        # somebody requires 'Ext.form.*', so for now we do the
        # simplest thing and ignore it.
        Class.new({:name => classname}, false)
      else
        context = @doc[:files][0]
        Logger.instance.warn(:extend, "Class #{classname} not found", context[:filename], context[:linenr])
        # Create placeholder class
        Class.new({:name => classname}, false)
      end
    end

    # Returns true when this class inherits from the specified class.
    # Also returns true when the class itself is the one we are asking about.
    def inherits_from?(class_name)
      return full_name == class_name || (parent ? parent.inherits_from?(class_name) : false)
    end

    # merges second members hash into first one
    def merge!(hash1, hash2, skip_overrides=false)
      hash2.each_pair do |name, m|
        if m[:meta] && m[:meta][:hide]
          if hash1[name]
            hash1.delete(name)
          else
            ctx = m[:files][0]
            msg = "@hide used but #{m[:tagname]} #{m[:name]} not found in parent class"
            Logger.instance.warn(:hide, msg, ctx[:filename], ctx[:linenr])
          end
        else
          if hash1[name]
            store_overrides(hash1[name], m)
          end
          hash1[name] = m
        end
      end
    end

    # Invoked when merge! finds two members with the same name.
    # New member always overrides the old, but inside new we keep
    # a list of members it overrides.  Normally one member will
    # override one other member, but a member from mixin can override
    # multiple members - although there's not a single such case in
    # ExtJS, we have to handle it.
    #
    # Every overridden member is listed just once.
    def store_overrides(old, new)
      # Sometimes a class is included multiple times (like Ext.Base)
      # resulting in its members overriding themselves.  Because of
      # this, ignore overriding itself.
      if new[:owner] != old[:owner]
        new[:overrides] = [] unless new[:overrides]
        unless new[:overrides].any? {|m| m[:owner] == old[:owner] }
          # Make a copy of the important properties for us.  We can't
          # just push the actual `old` member itself, because there
          # can be circular overrides (notably with Ext.Base), which
          # will result in infinite loop when we try to convert our
          # class into JSON.
          new[:overrides] << {
            :name => old[:name],
            :owner => old[:owner],
            :id => old[:id],
          }
        end
      end
    end

    # Generates local members hash by ID
    def new_local_members_hash
      unless @map_by_id
        @map_by_id = {}

        @doc[:members].each do |m|
          @map_by_id[m[:id]] = m
        end
      end

      @map_by_id
    end

    # Generates global members hash by ID
    def new_global_members_hash
      unless @global_map_by_id
        # Make copy of parent class members.
        # Otherwise we'll be merging directly into parent class.
        @global_map_by_id = parent ? parent.new_global_members_hash.clone : {}

        mixins.each do |mix|
          merge!(@global_map_by_id, mix.new_global_members_hash)
        end

        # Exclude all non-inheritable static members
        @global_map_by_id.delete_if {|id, m| m[:meta][:static] && !m[:inheritable] }

        merge!(@global_map_by_id, new_local_members_hash)
      end

      @global_map_by_id
    end

    # Generates global members hash by name
    def new_global_members_hash_by_name
      unless @global_map_by_name
        @global_map_by_name = {}

        new_global_members_hash.each_pair do |id, m|
          @global_map_by_name[m[:name]] = [] unless @global_map_by_name[m[:name]]
          @global_map_by_name[m[:name]] << m
        end
      end

      @global_map_by_name
    end

    # Searches members by name.  Finds both local members and those
    # inherited from parents and mixins.
    #
    # Returns an array of members found or empty array
    def find_members(query={})
      if query[:name]
        ms = new_global_members_hash_by_name[query[:name]] || []
      else
        ms = new_global_members_hash.values
      end

      if query[:tagname]
        ms = ms.find_all {|m| m[:tagname] == query[:tagname] }
      end

      if query[:static] == true
        ms = ms.find_all {|m| m[:meta] && m[:meta][:static] }
      elsif query[:static] == false
        ms = ms.reject {|m| m[:meta] && m[:meta][:static] }
      end

      ms
    end

    # This must be called whenever member hashes are changed.
    # It updates the :id fields of members and clears the caches.
    def update_members!(members)
      members.each do |m|
        m[:id] = Class.member_id(m)
      end
      invalidate_search_cache!
    end

    # Clears the search cache.
    # This is also REALLY BAD - try to get rid of it.
    def invalidate_search_cache!
      @map_by_id = nil
      @global_map_by_id = nil
      @global_map_by_name = nil

      parent.invalidate_search_cache! if parent

      mixins.each {|mix| mix.invalidate_search_cache! }
    end

    # Returns all local members of class
    def all_local_members
      @doc[:members]
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

    # Returns CSS icons class for the class
    def icon
      if @doc[:singleton]
        "icon-singleton"
      elsif inherits_from?("Ext.Component")
        "icon-component"
      else
        "icon-class"
      end
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

    # Generates member :id from member hash
    def self.member_id(m)
      # Sanitize $ in member names with something safer
      name = m[:name].gsub(/\$/, 'S-')
      "#{m[:meta][:static] ? 'static-' : ''}#{m[:tagname]}-#{name}"
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

  # String class for classnames that has extra method #exists? which
  # returns false when class with such name doesn't exist.
  #
  # This ability is used by JsDuck::Renderer, which only receives
  # names of various classes but needs to only render existing classes
  # as links.
  class ClassNameString < String
    def initialize(str, exists=true)
      super(str)
      @exists = exists
    end

    def exists?
      @exists
    end
  end

end
