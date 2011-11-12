module JsDuck

  # Writes JSON data to stdout
  class StdoutExporter
    def initialize(relations, opts)
      @relations = relations
      @opts = opts
    end

    def run(&format_classes)
      format_classes.call
      puts JsonDuck.generate(@relations.classes)
    end
  end

end
