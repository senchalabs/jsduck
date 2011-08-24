module JsDuck

  # Export class data as hash with :cfg being replace with :cfgs and
  # including all the inherited members too.  Same for :properties,
  # :methods, and :events.
  class Exporter
    def initialize(relations)
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

    # removes extra data from export
    def compact(cls)
      cls.delete(:doc)
      cls[:members] = compact_members_group(cls[:members])
      cls[:statics] = compact_members_group(cls[:statics])
      cls
    end

    def compact_members_group(group)
      c_group = {}
      group.each_pair do |type, members|
        c_group[type] = members.map {|m| compact_member(m) }
      end
      c_group
    end

    def compact_member(m)
      m_copy = {}
      [:name, :tagname, :owner, :protected, :static, :deprecated, :required].each do |key|
        m_copy[key] = m[key]
      end
      m_copy
    end
  end

end
