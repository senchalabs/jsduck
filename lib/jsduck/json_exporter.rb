require 'jsduck/class'

module JsDuck

  # Exporter for json format
  class JsonExporter
    def initialize(relations, opts)
      @relations = relations
    end

    # Returns all data in Class object as hash.
    def export(cls)
      h = cls.to_hash
      h[:members] = {}
      Class.default_members_hash.each_key do |key|
        h[:members][key] = cls.members(key)
        h[:statics][key] = cls.members(key, :statics)
      end
      h[:component] = cls.inherits_from?("Ext.Component")
      h[:superclasses] = cls.superclasses.collect {|c| c.full_name }
      h[:subclasses] = @relations.subclasses(cls).collect {|c| c.full_name }
      h[:mixedInto] = @relations.mixed_into(cls).collect {|c| c.full_name }
      h[:allMixins] = cls.all_mixins.collect {|c| c.full_name }
      h
    end

  end

end
