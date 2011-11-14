require 'jsduck/exporter'
require 'jsduck/json_duck'

module JsDuck

  # Exporter for json format
  class JsonExporter
    def initialize(relations, opts)
      @exporter = Exporter.new(relations)
    end

    # Extension for filename
    def extension
      ".json"
    end

    # Writes full class data in JSON format to file
    def write(filename, cls)
      JsonDuck.write_json(filename, @exporter.export(cls))
    end

  end

end
