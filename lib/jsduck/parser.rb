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
            :orig_comment => comment[:value],
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
      elsif look("Ext", ".", "define", "(", :string)
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

    # <ext-define> := "Ext" "." "define" "(" <string> "," <ext-define-cfg>
    def ext_define
      name = match("Ext", ".", "define", "(", :string)

      if look(",", "{")
        match(",")
        cfg = ext_define_cfg
      else
        cfg = {}
      end

      cfg[:type] = :ext_define
      cfg[:name] = name

      cfg
    end

    # <ext-define-cfg> := "{" ( <extend> | <mixins> | <?> )*
    def ext_define_cfg
      match("{")
      cfg = {}
      found = true
      while found
        found = false
        if look("extend", ":", :string)
          cfg[:extend] = ext_define_extend
          found = true
        elsif look("mixins", ":", "{")
          cfg[:mixins] = ext_define_mixins
          found = true
        elsif look(:ident, ":")
          match(:ident, ":")
          if look(:string) || look(:number) || look(:regex) ||
              look("true") || look("false") ||
              look("null") || look("undefined")
            # Some key with literal value -- ignore
            @lex.next
            found = true
          elsif look("[")
            # Some key with array of strings -- ignore
            found = array_of_strings
          end
        end
        match(",") if look(",")
      end
      cfg
    end

    # <ext-define-extend> := "extend" ":" <string>
    def ext_define_extend
      match("extend", ":", :string)
    end

    # <ext-define-mixins> := "mixins" ":" "{" [ <ident> ":" <string> ","? ]* "}"
    def ext_define_mixins
      match("mixins", ":", "{")
      mixins = []
      while look(:ident, ":", :string)
        mixins << match(:ident, ":", :string)
        match(",") if look(",")
      end
      match("}") if look("}")
      mixins
    end

    # <array-of-strings> := "[" [ <string> ","? ]* "]"
    def array_of_strings
      match("[")
      while look(:string)
        match(:string)
        match(",") if look(",")
      end

      if look("]")
        match("]")
        true
      else
        false
      end
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
