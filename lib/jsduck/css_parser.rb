require 'jsduck/css_lexer'

module JsDuck

  class CssParser
    def initialize(input, options = {})
      @lex = CssLexer.new(input)
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

    # <code-block> := <mixin-declaration> | <var-declaration> | <property>
    def code_block
      if look("@mixin")
        mixin_declaration
      elsif look(:var, ":")
        var_declaration
      else
        # Default to property like in JsParser.
        {:tagname => :property}
      end
    end

    # <mixin-declaration> := "@mixin" <ident>
    def mixin_declaration
      match("@mixin")
      return {
        :tagname => :css_mixin,
        :name => look(:ident) ? match(:ident) : nil,
      }
    end

    # <var-declaration> := <var> ":" <css-value>
    def var_declaration
      name = match(:var)
      match(":")
      value_list = css_value
      return {
        :tagname => :css_var,
        :name => name,
        :default => value_list.map {|v| v[:value] }.join(" "),
        :type => value_type(value_list),
      }
    end

    # <css-value> := ...anything up to... [ ";" | "}" | "!default" ]
    def css_value
      val = []
      while !look(";") && !look("}") && !look("!", "default")
        val << @lex.next(true)
      end
      val
    end

    # Determines type of CSS value
    def value_type(val)
      case val[0][:type]
      when :number
        "number"
      when :dimension
        "length"
      when :percentage
        "percentage"
      when :string
        "string"
      when :hash
        "color"
      when :ident
        case val[0][:value]
        when "true", "false"
          return "boolean"
        when "rgb", "rgba", "hsl", "hsla"
          return "color"
        when "black", "silver", "gray", "white", "maroon",
          "red", "purple", "fuchsia", "green", "lime", "olive",
          "yellow", "navy", "blue", "teal", "aqua", "orange"
          return "color"
        when "transparent"
          return "color"
        end
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
