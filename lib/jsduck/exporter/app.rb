require 'jsduck/renderer'
require 'jsduck/doc_formatter'
require 'jsduck/exporter/full'

module JsDuck
  module Exporter

    # Exports data for Docs app.
    class App < Full
      def initialize(relations, opts)
        super(relations, opts)
        @renderer = Renderer.new(opts)
      end

      # Returns compacted class data hash which contains an additional
      # :html field with full HTML to show on class overview page.
      def export(cls)
        data = super(cls)
        data[:html] = @renderer.render(data)
        return compact(data)
      end

      private

      # removes extra data from export
      def compact(cls)
        cls.delete(:doc)
        cls[:members] = compact_members_group(cls[:members])
        cls[:statics] = compact_members_group(cls[:statics])
        cls[:files] = compact_files(cls[:files])
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
        [:name, :tagname, :owner, :meta, :id].each do |key|
          m_copy[key] = m[key]
        end
        m_copy
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
