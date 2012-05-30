require 'jsduck/lexer'
require 'jsduck/doc_parser'

module JsDuck

  class CssParser
    def initialize(input, options = {})
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
            :code => code_block
          }
        else
          @lex.next
        end
      end
      @docs
    end

    # <code-block> := <mixin-declaration> | <var-declaration> | <nop>
    def code_block
      if look("@", "mixin")
        return mixin_declaration
      elsif look(:ident)
        var = var_declaration
        return var if var
      end

      return {:type => :nop}
    end

    # <mixin-declaration> := "@mixin" <css-ident>
    def mixin_declaration
      match("@", "mixin")
      return {
        :type => :css_mixin,
        :name => look(:ident) ? css_ident : nil,
      }
    end

    # <var> := <css-ident> ":" <css-value>
    def var_declaration
      name = css_ident
      return nil unless name =~ /\A\$/ && look(":")

      match(":")
      val = css_value
      return {
        :type => :css_var,
        :name => name,
        :value => {
          :default => val,
          :type => value_type(val),
        }
      }
    end

    # <css-value> := ...anything up to... [ ";" | "}" ]
    def css_value
      val = []
      while !look(";") && !look("}") && !look("!", :default)
        tok = @lex.next(true)
        if tok[:type] == :string
          val << '"' + tok[:value] + '"'
        else
          val << tok[:value]
        end
      end
      val.join("");
    end

    # <css-ident> := <ident>  [ "-" <ident> ]*
    def css_ident
      chain = [match(:ident)]
      while look("-", :ident) do
        chain << match("-", :ident)
      end
      return chain.join("-")
    end

    # Determines type of CSS value
    def value_type(val)
      case val
      when /\A([0-9]+(\.[0-9]*)?|\.[0-9]+)\Z/
        "number"
      when /\A([0-9]+(\.[0-9]*)?|\.[0-9]+)[a-z]+\Z/
        "measurement"
      when /\A([0-9]+(\.[0-9]*)?|\.[0-9]+)?%\Z/
        "percentage"
      when /\A(true|false)\Z/
        "boolean"
      when /\A".*"\Z/
        "string"
      when /\A#[0-9a-fA-F]{3}\Z/
        "color"
      when /\A#[0-9a-fA-F]{6}\Z/
        "color"
      when /\A(rgb|hsl)a?\(.*\)\Z/
        "color"
      when /\A(black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|orange)\Z/
        "color"
      when /\Atransparent\Z/
        "color"
      else
        nil
      end
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
