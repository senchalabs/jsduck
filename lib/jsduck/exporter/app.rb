require 'jsduck/render/class'
require 'jsduck/exporter/full'
require 'jsduck/tag_registry'
require 'jsduck/web/class_icons'

module JsDuck
  module Exporter

    # Exports data for Docs app.
    class App
      def initialize(relations, opts)
        @full_exporter = Exporter::Full.new(relations, opts)
        @relations = relations
        @renderer = Render::Class.new(opts)
      end

      # Returns compacted class data hash which contains an additional
      # :html field with full HTML to show on class overview page.
      def export(cls)
        data = @full_exporter.export(cls)

        data[:classIcon] = Web::ClassIcons.get(cls)
        data[:superclasses] = cls.superclasses.collect {|c| c[:name] }
        data[:subclasses] = @relations.subclasses(cls).collect {|c| c[:name] }.sort
        data[:mixedInto] = @relations.mixed_into(cls).collect {|c| c[:name] }.sort
        data[:alternateClassNames] = cls[:alternateClassNames].sort if cls[:alternateClassNames]

        data[:mixins] = cls.deps(:mixins).collect {|c| c[:name] }.sort
        data[:parentMixins] = cls.parent_deps(:mixins).collect {|c| c[:name] }.sort
        data[:requires] = cls.deps(:requires).collect {|c| c[:name] }.sort
        data[:uses] = cls.deps(:uses).collect {|c| c[:name] }.sort

        data[:html] = @renderer.render(data)

        return compact(data)
      end

      private

      # removes extra data from export
      def compact(cls)
        cls.delete(:doc)
        cls[:members] = cls[:members].map {|m| compact_member(m) }
        cls[:files] = compact_files(cls[:files])
        cls[:meta] = combine_meta(cls)
        cls
      end

      def compact_member(m)
        m_copy = {}
        [:name, :tagname, :owner, :id].each do |key|
          m_copy[key] = m[key]
        end
        m_copy[:meta] = combine_meta(m)
        m_copy
      end

      # Add data for builtin tags with signatures to :meta field.
      def combine_meta(m)
        meta = {}
        TagRegistry.signatures.each do |s|
          name = s[:tagname]
          meta[name] = m[name] if m[name]
        end
        meta
      end

      # Remove full path from filename for privacy considerations as the
      # path can reveal information about the system where JSDuck was
      # run.  The docs app doesn't need to have this information.
      def compact_files(files)
        files.map do |f|
          {:filename => File.basename(f[:filename]), :href => f[:href]}
        end
      end

    end

  end
end
