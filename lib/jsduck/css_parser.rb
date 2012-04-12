require 'jsduck/lexer'

module JsDuck

  class CssParser
    def initialize(input, options = {})
      @lex = Lexer.new(input)
      @docs = []
    end

    # Parses the whole CSS block and returns same kind of structure
    # that JavaScript parser does.
    def parse
      while !@lex.empty? do
        if look(:doc_comment)
          comment = @lex.next(true)
          @docs << {
            :comment => comment[:value],
            :linenr => comment[:linenr],
            :code => code_block,
            :type => :doc_comment,
          }
        else
          @lex.next
        end
      end
      @docs
    end

    # <code-block> := <mixin> | <nop>
    def code_block
      if look("@", "mixin")
        mixin
      else
        {:type => :nop}
      end
    end

    # <mixin> := "@mixin" <css-ident>
    def mixin
      match("@", "mixin")
      return {
        :type => :css_mixin,
        :name => look(:ident) ? css_ident : nil,
      }
    end

    # <css-ident> := <ident>  [ "-" <ident> ]*
    def css_ident
      chain = [match(:ident)]
      while look("-", :ident) do
        chain << match("-", :ident)
      end
      return chain.join("-")
    end

    # Matches all arguments, returns the value of last match
    # When the whole sequence doesn't match, throws exception
    def match(*args)
      if look(*args)
        last = nil
        args.length.times { last = @lex.next }
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
