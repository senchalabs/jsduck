require 'jsduck/lexer'
require 'jsduck/doc_parser'

module JsDuck

  class CssParser
    def initialize(input)
      @lex = Lexer.new(input)
      @doc_parser = DocParser.new
      @docs = []
    end

    # Parses the whole CSS block and returns same kind of structure
    # that JavaScript parser does.
    def parse
      while !@lex.empty? do
        if look(:doc_comment)
          comment = @lex.next(true)
          @docs << {
            :comment => @doc_parser.parse(comment[:value]),
            :linenr => comment[:linenr],
            :code => {:type => :nop}
          }
        else
          @lex.next
        end
      end
      @docs
    end

    def look(*args)
      @lex.look(*args)
    end
  end

end
