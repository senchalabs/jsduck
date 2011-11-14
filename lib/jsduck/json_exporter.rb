require 'jsduck/exporter'

module JsDuck

  # Exporter for json format
  class JsonExporter
    def initialize(relations, opts)
      @exporter = Exporter.new(relations)
    end

    # Returns full class data hash
    def export
      @exporter.export(cls)
    end

  end

end
