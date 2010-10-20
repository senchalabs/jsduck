require 'lexer'
require 'doc_comment_parser'
require 'doc_comment'

module JsDuck

  class Parser
    def initialize(input)
      @lex = Lexer.new(input)
      @doc_parser = DocCommentParser.new
      @docs = []
    end

    def parse
      while !@lex.empty? do
        if look(:doc_comment) then
          doc = DocComment.new(@doc_parser.parse(match(:doc_comment)))
          block = code_block
          if block[:type] == :function then
            doc.set_default_name(*block[:name]) if block[:name]
            doc.set_default_params(block[:params])
          elsif block[:type] == :assignment then
            doc.set_default_name(*block[:left])
            if block[:right] then
              right = block[:right]
              if right[:type] == :function then
                doc.set_default_params(right[:params])
              elsif right[:type] == :ext_extend then
                doc.set_default_extends(right[:extend])
              end
            end
          end
          @docs << doc
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
      elsif look(:ident) then
        maybe_assignment
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

    # <ident-chain> := <ident> [ "." <ident> ]*
    def ident_chain
      chain = [match(:ident)]
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
        :left => left,
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
