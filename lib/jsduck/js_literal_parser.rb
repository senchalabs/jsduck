require 'jsduck/lexer'

module JsDuck

  # Parser for JavaScript literals: numbers, strings, booleans,
  # regexes, arrays, objects.
  #
  # Almost like a JSON parser, but regexes are also valid values and
  # object keys don't need to be quoted.
  class JsLiteralParser
    def initialize(input)
      @lex = Lexer.new(input)
    end

    # Parses a literal.
    #
    # Returns a Ruby hash representing this literal.  For example parsing this:
    #
    #     [5, "foo"]
    #
    # Returns the following structure:
    #
    #     {:type => :array, :value => [
    #         {:type => :number, :value => "5"},
    #         {:type => :string, :value => "foo"}
    #     ]}
    #
    def literal
      if look(:number)
        match(:number)
      elsif look(:string)
        match(:string)
      elsif look(:regex)
        match(:regex)
      elsif look("[")
        array_literal
      elsif look("{")
        object_literal
      elsif look(:ident) && (look("true") || look("false") || look("undefined") || look("null"))
        match(:ident)
      end
    end

    def array_literal
      match("[")
      r = []
      while (lit = literal)
        r << lit
        break unless look(",")
        match(",")
      end
      return unless look("]")
      match("]")
      return {:type => :array, :value => r}
    end

    def object_literal
      match("{")
      r = []
      while (lit = object_literal_pair)
        r << lit
        break unless look(",")
        match(",")
      end
      return unless look("}")
      match("}")
      return {:type => :object, :value => r}
    end

    def object_literal_pair
      if look(:ident)
        key = match(:ident)
      elsif look(:string)
        key = match(:string)
      else
        return
      end

      return unless look(":")
      match(":")

      value = literal
      return unless value

      return {:key => key, :value => value}
    end

    # Matches all arguments, returns the value of last match
    # When the whole sequence doesn't match, throws exception
    def match(*args)
      if look(*args)
        last = nil
        args.length.times { last = @lex.next(true) }
        last
      else
        throw "Expected: " + args.join(", ")
      end
    end

    def look(*args)
      @lex.look(*args)
    end
  end

end
