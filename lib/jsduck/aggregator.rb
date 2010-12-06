module JsDuck

  # Combines JavaScript Parser, DocParser and Merger.
  # Produces array of classes as result.
  class Aggregator
    def initialize
      @documentation = []
      @doc_parser = DocParser.new
      @merger = Merger.new
    end

    def parse(input)
      current_class = nil
      Parser.new(input).parse.each do |docset|
        node = @merger.merge(@doc_parser.parse(docset[:comment]), docset[:code])
        # all methods, cfgs, ... following a class will be added to that class
        if node[:tagname] == :class
          current_class = node
          @documentation << node
        elsif current_class
          current_class[ node[:tagname] ] << node
        else
          @documentation << node
        end
      end
    end

    def result
      @documentation
    end
  end

end
