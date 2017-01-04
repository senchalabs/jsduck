require 'jsduck/class'

module JsDuck
  module Exporter

    # Exporter for all the class docs.
    class Full
      def initialize(relations, opts={})
        @relations = relations
        # opts parameter is here just for compatibility with other exporters
      end

      # Returns all data in Class object as hash.
      def export(cls)
        # Make copy of the internal data structure of a class
        # so our modifications on it will be safe.
        h = cls.internal_doc.clone

        h[:members] = {}
        h[:statics] = {}
        Class.each_member_type do |tagname|
          h[:members][tagname] = export_members(cls, {:tagname => tagname, :static => false})
          h[:statics][tagname] = export_members(cls, {:tagname => tagname, :static => true})
        end
        h[:component] = cls.inherits_from?("Ext.Component")
        h[:superclasses] = cls.superclasses.collect {|c| c[:name] }
        h[:subclasses] = @relations.subclasses(cls).collect {|c| c[:name] }.sort
        h[:mixedInto] = @relations.mixed_into(cls).collect {|c| c[:name] }.sort
        h[:alternateClassNames] = cls[:alternateClassNames].sort if cls[:alternateClassNames]

        h[:mixins] = cls.deps(:mixins).collect {|c| c[:name] }.sort
        h[:parentMixins] = cls.parent_deps(:mixins).collect {|c| c[:name] }.sort
        h[:requires] = cls.deps(:requires).collect {|c| c[:name] }.sort
        h[:uses] = cls.deps(:uses).collect {|c| c[:name] }.sort

        h
      end

      private

      # Looks up members, and sorts them so that constructor method is first
      def export_members(cls, cfg)
        ms = cls.find_members(cfg)
        ms.sort! {|a,b| a[:name] <=> b[:name] }
        cfg[:tagname] == :method ? constructor_first(ms) : ms
      end

      # If methods list contains constructor, move it into the beginning.
      def constructor_first(ms)
        constr = ms.find {|m| JsDuck::Class.constructor?(m) }
        if constr
          ms.delete(constr)
          ms.unshift(constr)
        end
        ms
      end

    end

  end
end
