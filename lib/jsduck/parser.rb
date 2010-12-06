require 'jsduck/lexer'

module JsDuck

  class Parser
    def initialize(input)
      @lex = Lexer.new(input)
      @docs = []
    end

    # Parses the whole JavaScript block and returns array where for
    # each doc-comment there is a hash of two values: the comment
    # itself as string and parsed structure of the code that
    # immediately follows the comment.
    #
    # For example with the following JavaScript input:
    #
    # /**
    #  * @param {String} foo
    #  */
    # MyClass.doIt = function(foo, bar) {
    # }
    #
    # The return value of this function will be:
    #
    # [
    #   {
    #     :comment => "/**\n * @param {String} foo\n */",
    #     :code => {
    #       :type => :assignment,
    #       :left => ["MyClass", "doIt"],
    #       :right => {
    #         :type => :function,
    #         :name => nil,
    #         :params => [
    #           {:name => "foo"},
    #           {:name => "bar"}
    #         ]
    #       }
    #     }
    #   }
    # ]
    #
    def parse
      while !@lex.empty? do
        if look(:doc_comment) then
          @docs << {
            :comment => match(:doc_comment),
            :code => code_block
          }
        else
          @lex.next
        end
      end
      @docs
    end

    # The following is a recursive-descent parser for JavaScript that
    # can possibly follow a doc-comment

    # <code-block> := <function> | <var-declaration> | <assignment> | <property-literal>
    def code_block
      if look("function") then
        function
      elsif look("var") then
        var_declaration
      elsif look(:ident, ":") || look(:string, ":") then
        property_literal
      elsif look(:ident) || look("this") then
        maybe_assignment
      elsif look(:string) then
        {:type => :assignment, :left => [match(:string)]}
      else
        {:type => :nop}
      end
    end

    # <function> := "function" [ <ident> ] <function-parameters> <function-body>
    def function
      match("function")
      return {
        :type => :function,
        :name => look(:ident) ? match(:ident) : nil,
        :params => function_parameters,
        :body => function_body,
      }
    end

    # <function-parameters> := "(" [ <ident> [ "," <ident> ]* ] ")"
    def function_parameters
      match("(")
      params = look(:ident) ? [{:name => match(:ident)}] : []
      while look(",", :ident) do
        params << {:name => match(",", :ident)}
      end
      match(")")
      return params
    end

    # <function-body> := "{" ...
    def function_body
      match("{")
    end

    # <var-declaration> := "var" <assignment>
    def var_declaration
      match("var")
      maybe_assignment
    end

    # <maybe-assignment> := <ident-chain> [ "=" <expression> ]
    def maybe_assignment
      left = ident_chain
      if look("=") then
        match("=")
        right = expression
      end
      return {
        :type => :assignment,
        :left => left,
        :right => right,
      }
    end

    # <ident-chain> := [ "this" | <ident> ]  [ "." <ident> ]*
    def ident_chain
      if look("this")
        chain = [match("this")]
      else
        chain = [match(:ident)]
      end

      while look(".", :ident) do
        chain << match(".", :ident)
      end
      return chain
    end

    # <expression> := <function> | <ext-extend> | <literal>
    # <literal> := <string> | <boolean> | <number> | <regex>
    def expression
      if look("function") then
        function
      elsif look("Ext", ".", "extend") then
        ext_extend
      elsif look(:string) then
        {:type => :literal, :class => "String"}
      elsif look("true") || look("false") then
        {:type => :literal, :class => "Boolean"}
      elsif look(:number) then
        {:type => :literal, :class => "Number"}
      elsif look(:regex) then
        {:type => :literal, :class => "RegExp"}
      end
    end

    # <ext-extend> := "Ext" "." "extend" "(" <ident-chain> "," ...
    def ext_extend
      match("Ext", ".", "extend", "(")
      return {
        :type => :ext_extend,
        :extend => ident_chain,
      }
    end

    # <property-literal> := ( <ident> | <string> ) ":" <expression>
    def property_literal
      left = look(:ident) ? match(:ident) : match(:string)
      match(":")
      right = expression
      return {
        :type => :assignment,
        :left => [left],
        :right => right,
      }
    end

    # Matches all arguments, returns the value of last match
    # When the whole sequence doesn't match, throws exception
    def match(*args)
      if look(*args) then
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
