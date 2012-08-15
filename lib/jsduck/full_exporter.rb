require 'jsduck/class'

module JsDuck

  # Exporter for all the class docs.
  class FullExporter
    def initialize(relations, opts)
      @relations = relations
      # opts parameter is here just for compatibility with other exporters
    end

    # Returns all data in Class object as hash.
    def export(cls)
      h = cls.to_hash
      h[:members] = {}
      h[:statics] = {}
      Class.default_members_hash.each_key do |key|
        h[:members][key] = cls.members(key)
        h[:statics][key] = cls.members(key, :statics)
      end
      h[:component] = cls.inherits_from?("Ext.Component")
      h[:superclasses] = cls.superclasses.collect {|c| c.full_name }
      h[:subclasses] = @relations.subclasses(cls).collect {|c| c.full_name }
      h[:mixedInto] = @relations.mixed_into(cls).collect {|c| c.full_name }

      h[:mixins] = cls.deps(:mixins).collect {|c| c.full_name }
      h[:parentMixins] = cls.parent_deps(:mixins).collect {|c| c.full_name }
      h[:requires] = cls.deps(:requires).collect {|c| c.full_name }
      h[:uses] = cls.deps(:uses).collect {|c| c.full_name }

      h
    end

  end

end
