require 'jsduck/logger'
require 'jsduck/members_index'

module JsDuck

  # Encapsulates class documentation and provides some commonly needed
  # methods on it.  Otherwise it acts like Hash, providing the []
  # method.
  class Class
    attr_accessor :relations

    # Used only by MembersIndex class itself to access the
    # MembersIndex instances of parents and mixins.
    attr_accessor :members_index

    # Creates JSDuck class.
    #
    # Pass true as second parameter to create a placeholder class.
    def initialize(doc, class_exists=true)
      @doc = doc

      # Wrap classname into custom string class that allows
      # differenciating between existing and missing classes.
      @doc[:name] = ClassNameString.new(@doc[:name], class_exists)

      @doc[:members] = [] if !@doc[:members]

      @members_index = MembersIndex.new(self)

      @relations = nil
    end

    # Returns the internal doc object.
    def internal_doc
      @doc
    end

    # Sets the internal doc object.
    #
    # The doc object is processed in parallel and then assigned back
    # through this method.  But because of parallel processing the
    # assigned doc object will not be just a modified old @doc but a
    # completely new.  If we were to just assign to @doc the
    # #find_members caches would still point to old @doc members
    # resulting in mysterious errors further along...
    def internal_doc=(doc)
      @doc.merge!(doc) do |key, oldval, newval|
        if key == :members
          oldval.zip(newval) do |ms|
            ms[0].merge!(ms[1])
          end
          oldval
        else
          newval
        end
      end
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
        Logger.warn(:extend, "Class #{classname} not found", context[:filename], context[:linenr])
        # Create placeholder class
        Class.new({:name => classname}, false)
      end
    end

    # Returns true when this class inherits from the specified class.
    # Also returns true when the class itself is the one we are asking about.
    def inherits_from?(class_name)
      return @doc[:name] == class_name || (parent ? parent.inherits_from?(class_name) : false)
    end

    # Returns list of members filtered by a query.
    # Searches both local and inherited members.
    #
    # The query hash can contain the following fields:
    #
    # - :name : String    - the name of the member to find.
    #
    # - :tagname : Symbol - the member type to look for.
    #
    # - :static : Boolean - true to only return static members,
    #                       false to only return instance members.
    #                       When nil or unspecified, both static
    #                       and instance members are returned.
    #
    # - :local : Boolean -  true to only return non-inherited members.
    #
    # When called without arguments all members are returned.
    #
    # When nothing found, an empty array is returned.
    def find_members(query={})
      if query[:name]
        ms = @members_index.global_by_name[query[:name]] || []
        ms = ms.find_all {|m| m[:owner] == @doc[:name]} if query[:local]
      elsif query[:local]
        ms = @members_index.all_local
      else
        ms = @members_index.all_global
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
      @members_index.invalidate!
    end

    # Returns all local members of class
    def all_local_members
      @doc[:members]
    end

    # Static methods

    # Generates member :id from member hash
    def self.member_id(m)
      # Sanitize $ in member names with something safer
      name = m[:name].gsub(/\$/, 'S-')
      "#{m[:meta][:static] ? 'static-' : ''}#{m[:tagname]}-#{name}"
    end

    # Loops through all available member types,
    # passing the tagname of the member to the block.
    def self.each_member_type(&block)
      [:cfg, :property, :method, :event, :css_var, :css_mixin].each(&block)
    end

    # True if the given member is a constructor method
    def self.constructor?(member)
      member[:tagname] == :method && member[:name] == "constructor"
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
