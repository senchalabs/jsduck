require 'jsduck/logger'

module JsDuck

  # Helper for JsDuck::Class for indexing its members.
  #
  # While indexing the members of a class it accesses the MembersIndex
  # instances of parent and mixins of that class through the
  # #members_index accessor.  This isn't the nicest approach, but
  # better than having all of this functionality inside the
  # JsDuck::Class itself.
  class MembersIndex
    def initialize(cls)
      @cls = cls
      @map_by_id = nil
      @global_map_by_id = nil
      @global_map_by_name = nil
    end

    # Returns hash of all members by name (including inherited ones)
    def global_by_name
      unless @global_map_by_name
        @global_map_by_name = {}

        global_by_id.each_pair do |id, m|
          @global_map_by_name[m[:name]] = [] unless @global_map_by_name[m[:name]]
          @global_map_by_name[m[:name]] << m
        end
      end

      @global_map_by_name
    end

    # Returns array of all members (including inherited ones)
    def all_global
      global_by_id.values
    end

    # Returns array of all local members (excludes inherited ones)
    def all_local
      local_by_id.values.reject {|m| m[:meta] && m[:meta][:hide] }
    end

    # Clears the search cache.
    # Using this is REALLY BAD - try to get rid of it.
    def invalidate!
      @map_by_id = nil
      @global_map_by_id = nil
      @global_map_by_name = nil

      @cls.parent.members_index.invalidate! if @cls.parent

      @cls.mixins.each {|mix| mix.members_index.invalidate! }
    end

    protected

    # Returns hash of all members by ID (including inherited ones)
    def global_by_id
      unless @global_map_by_id
        # Make copy of parent class members.
        # Otherwise we'll be merging directly into parent class.
        @global_map_by_id = @cls.parent ? @cls.parent.members_index.global_by_id.clone : {}

        @cls.mixins.each do |mix|
          merge!(@global_map_by_id, mix.members_index.global_by_id)
        end

        # Exclude all non-inheritable static members
        @global_map_by_id.delete_if {|id, m| m[:meta][:static] && !m[:inheritable] }

        merge!(@global_map_by_id, local_by_id)
      end

      @global_map_by_id
    end

    # Returns hash of local members by ID (no inherited members)
    def local_by_id
      unless @map_by_id
        @map_by_id = {}

        @cls[:members].each do |m|
          @map_by_id[m[:id]] = m
        end
      end

      @map_by_id
    end

    private

    # merges second members hash into first one
    def merge!(hash1, hash2)
      hash2.each_pair do |name, m|
        if m[:meta] && m[:meta][:hide]
          if hash1[name]
            hash1.delete(name)
          else
            ctx = m[:files][0]
            msg = "@hide used but #{m[:tagname]} #{m[:name]} not found in parent class"
            Logger.warn(:hide, msg, ctx[:filename], ctx[:linenr])
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

  end

end
