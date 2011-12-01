require 'jsduck/lexer'
require 'jsduck/doc_parser'
require 'jsduck/js_literal_parser'
require 'jsduck/js_literal_builder'

module JsDuck

  class JsParser < JsLiteralParser
    def initialize(input, options = {})
      super(input)
      @doc_parser = DocParser.new(:js)
      @docs = []
      @ext_namespaces = options[:ext_namespaces] || ["Ext"]
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
      elsif ext_look(:ns, ".", "define", "(", :string)
        ext_define
      elsif ext_look(:ns, ".", "ClassManager", ".", "create", "(", :string)
        ext_define
      elsif look(:ident, ":") || look(:string, ":")
        property_literal
      elsif look(",", :ident, ":") || look(",", :string, ":")
        match(",")
        property_literal
      elsif look(:ident) || look("this")
        maybe_assignment
      elsif look(:string)
        {:type => :assignment, :left => [match(:string)[:value]]}
      else
        {:type => :nop}
      end
    end

    # <function> := "function" [ <ident> ] <function-parameters> <function-body>
    def function
      match("function")
      return {
        :type => :function,
        :name => look(:ident) ? match(:ident)[:value] : nil,
        :params => function_parameters,
        :body => function_body,
      }
    end

    # <function-parameters> := "(" [ <ident> [ "," <ident> ]* ] ")"
    def function_parameters
      match("(")
      params = look(:ident) ? [{:name => match(:ident)[:value]}] : []
      while look(",", :ident) do
        params << {:name => match(",", :ident)[:value]}
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
        chain = [match("this")[:value]]
      else
        chain = [match(:ident)[:value]]
      end

      while look(".", :ident) do
        chain << match(".", :ident)[:value]
      end
      return chain
    end

    # <expression> := <function> | <ext-extend> | <ext-base-css-prefix> | <literal>
    def expression
      if look("function")
        function
      elsif ext_look(:ns, ".", "extend")
        ext_extend
      elsif ext_look(:ns, ".", "baseCSSPrefix", "+", :string)
        ext_base_css_prefix
      else
        my_literal
      end
    end

    # <literal> := ...see JsLiteralParser...
    def my_literal
      lit = literal
      return unless lit && literal_expression_end?

      cls_map = {
        :string => "String",
        :number => "Number",
        :regex => "RegExp",
        :array => "Array",
        :object => "Object",
      }

      if cls_map[lit[:type]]
        cls = cls_map[lit[:type]]
      elsif lit[:type] == :ident && (lit[:value] == "true" || lit[:value] == "false")
        cls = "Boolean"
      else
        cls = nil
      end

      value = JsLiteralBuilder.new.to_s(lit)

      {:type => :literal, :class => cls, :value => value}
    end

    # True when we're at the end of literal expression.
    # ",", ";" and "}" are the normal closing symbols, but for
    # our docs purposes doc-comment and file end work too.
    def literal_expression_end?
      look(",") || look(";") || look("}") || look(:doc_comment) || @lex.empty?
    end

    # <ext-extend> := "Ext" "." "extend" "(" <ident-chain> "," ...
    def ext_extend
      match(:ident, ".", "extend", "(")
      return {
        :type => :ext_extend,
        :extend => ident_chain,
      }
    end

    # <ext-base-css-prefix> := "Ext" "." "baseCSSPrefix" "+" <string>
    def ext_base_css_prefix
      match(:ident, ".", "baseCSSPrefix", "+")
      return {
        :type => :literal,
        :class => "String",
        :value => '"x-' + match(:string)[:value] + '"',
      }
    end

    # <ext-define> := "Ext" "." ["define" | "ClassManager" "." "create" ] "(" <string> "," <ext-define-cfg>
    def ext_define
      match(:ident, ".");
      look("define") ? match("define") : match("ClassManager", ".", "create");
      name = match("(", :string)[:value]

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

    # <ext-define-cfg> := "{" ( <extend> | <mixins> | <alternate-class-name> | <alias> |
    #                           <xtype> | <requires> | <uses> | <singleton> | <?> )*
    def ext_define_cfg
      match("{")
      cfg = {}
      found = true
      while found
        found = false
        if found = ext_define_extend
          cfg[:extend] = found
        elsif found = ext_define_mixins
          cfg[:mixins] = found
        elsif found = ext_define_alternate_class_name
          cfg[:alternateClassNames] = found
        elsif found = ext_define_alias
          cfg[:alias] = found
        elsif found = ext_define_xtype
          cfg[:xtype] = found
        elsif found = ext_define_requires
          cfg[:requires] = found
        elsif found = ext_define_uses
          cfg[:uses] = found
        elsif found = ext_define_singleton
          cfg[:singleton] = found
        elsif found = ext_define_whatever
          # ignore this
        end
        match(",") if look(",")
      end
      cfg
    end

    # <extend> := "extend" ":" <string>
    def ext_define_extend
      if look("extend", ":", :string)
        match("extend", ":", :string)[:value]
      end
    end

    # <mixins> := "mixins" ":" [ <object-literal> | <array-literal> ]
    def ext_define_mixins
      if look("mixins", ":")
        match("mixins", ":")
        lit = literal
        if lit && lit[:type] == :object
          lit[:value].map {|x| x[:value][:value] }
        elsif lit && lit[:type] == :array
          lit[:value].map {|x| x[:value] }
        else
          nil
        end
      end
    end

    # <alternate-class-name> := "alternateClassName" ":" <string-or-list>
    def ext_define_alternate_class_name
      if look("alternateClassName", ":")
        match("alternateClassName", ":")
        string_or_list
      end
    end

    # <alias> := "alias" ":" <string-or-list>
    def ext_define_alias
      if look("alias", ":")
        match("alias", ":")
        string_or_list
      end
    end

    # <xtype> := "xtype" ":" <string-or-list>
    def ext_define_xtype
      if look("xtype", ":")
        match("xtype", ":")
        string_or_list
      end
    end

    # <requires> := "requires" ":" <string-or-list>
    def ext_define_requires
      if look("requires", ":")
        match("requires", ":")
        string_or_list
      end
    end

    # <uses> := "uses" ":" <string-or-list>
    def ext_define_uses
      if look("uses", ":")
        match("uses", ":")
        string_or_list
      end
    end

    # <singleton> := "singleton" ":" "true"
    def ext_define_singleton
      if look("singleton", ":", "true")
        match("singleton", ":", "true")
        true
      end
    end

    # <?> := <ident> ":" <literal>
    def ext_define_whatever
      if look(:ident, ":")
        match(:ident, ":")
        literal
      end
    end

    # <string-or-list> := ( <string> | <array-literal> )
    def string_or_list
      lit = literal
      if lit && lit[:type] == :string
        [ lit[:value] ]
      elsif lit && lit[:type] == :array
        lit[:value].map {|x| x[:value] }
      else
        []
      end
    end

    # <property-literal> := ( <ident> | <string> ) ":" <expression>
    def property_literal
      left = look(:ident) ? match(:ident)[:value] : match(:string)[:value]
      match(":")
      right = expression
      return {
        :type => :assignment,
        :left => [left],
        :right => right,
      }
    end

    # Like look() but tries to match as the first argument all the
    # names listed in @ext_namespaces
    def ext_look(placeholder, *args)
      @ext_namespaces.each do |ns|
        return true if look(ns, *args)
      end
      return false
    end

  end

end
