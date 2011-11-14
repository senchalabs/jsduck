require 'jsduck/exporter'
require 'jsduck/json_duck'
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

    # Extension for filename
    def extension
      ".js"
    end

    # Writes compacted class data in JsonP format to file
    def write(filename, cls)
      data = @exporter.export(cls)
      data[:html] = @renderer.render(data)
      data = @exporter.compact(data)
      JsonDuck.write_jsonp(filename, cls[:name].gsub(/\./, "_"), data)
    end

  end

end
