require 'jsduck/exporter'
require 'jsduck/renderer'
require 'jsduck/doc_formatter'

module JsDuck

  # Exporter for JsonP format
  class JsonPExporter
    def initialize(relations, opts)
      @exporter = Exporter.new(relations)

      @renderer = Renderer.new
      # Inject formatter to all meta-tags.
      doc_formatter = DocFormatter.new(@relations, @opts)
      @opts.meta_tags.each {|tag| tag.formatter = doc_formatter }
      renderer.meta_tags = @opts.meta_tags
    end

    # Returns compacted class data hash
    def export(cls)
      data = @exporter.export(cls)
      data[:html] = @renderer.render(data)
      return @exporter.compact(data)
    end

  end

end
