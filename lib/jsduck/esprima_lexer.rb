require 'jsduck/esprima_tokenizer'

module JsDuck

  # New experimental lexer that uses Esprima.js through V8.
  class EsprimaLexer
    def initialize(input)
      @tokens = EsprimaTokenizer.instance.tokenize(input)
      @position = 0
    end

    def look(*tokens)
      i = @position
      tokens.all? do |t|
        tok = @tokens[i]
        i += 1
        if !tok
          false
        elsif t.instance_of?(Symbol)
          tok[:type] == t
        else
          tok[:value] == t
        end
      end
    end

    def next(full=false)
      tok = @tokens[@position]
      @position += 1
      full ? tok : tok[:value]
    end

    def empty?
      !@tokens[@position]
    end

  end
end
