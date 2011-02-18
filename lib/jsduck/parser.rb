require 'jsduck/lexer'
require 'jsduck/doc_parser'

module JsDuck

  class Parser
    def initialize(input)
      @lex = Lexer.new(input)
      @doc_parser = DocParser.new
      @docs = []
    end

    # Parses the whole JavaScript block and returns array where for
    # each doc-comment there is a hash of three values: the comment
    # structure created by DocParser, number of the line where the
    # comment starts, and parsed structure of the code that
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
    #     :comment => [
    #       {:tagname => :default, :doc => "Method description"},
    #       {:tagname => :return, :type => "Number", :doc => ""},
    #     ],
    #     :linenr => 1,
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

    # The following is a recursive-descent parser for JavaScript that
    # can possibly follow a doc-comment

    # <code-block> := <function> | <var-declaration> | <ext-define> |
    #                 <assignment> | <property-literal>
    def code_block
      if look("function")
        function
      elsif look("var")
        var_declaration
      elsif look("Ext", ".", "define", "(")
        ext_define
      elsif look(:ident, ":") || look(:string, ":")
        property_literal
      elsif look(",", :ident, ":") || look(",", :string, ":")
        match(",")
        property_literal
      elsif look(:ident) || look("this")
        maybe_assignment
      elsif look(:string)
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
      if look("=")
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
      if look("function")
        function
      elsif look("Ext", ".", "extend")
        ext_extend
      elsif look(:string)
        {:type => :literal, :class => "String"}
      elsif look("true") || look("false")
        {:type => :literal, :class => "Boolean"}
      elsif look(:number)
        {:type => :literal, :class => "Number"}
      elsif look(:regex)
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

    # <ext-define> := "Ext" "." "define" "(" <string> "," ...
    def ext_define
      match("Ext", ".", "define", "(")
      return {
        :type => :function,
        :name => look(:string) ? match(:string) : nil,
        :params => []
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
