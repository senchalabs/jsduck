#!/usr/bin/env ruby
require 'strscan'
require 'pp'

module JsDuck

  class Lexer
    def initialize(input)
      @input = StringScanner.new(input)
      tokenize
    end

    def look(*tokens)
      i = 0
      tokens.all? do |t|
        tok = @tokens[i]
        i += 1
        return false if tok == nil
        if t.instance_of?(Symbol) then
          tok[:type] == t
        else
          tok[:value] == t
        end
      end
    end

    def next
      @tokens.shift[:value]
    end

    def empty?
      @tokens.empty?
    end

    # Goes through the whole input and tokenizes it
    def tokenize
      @tokens = []
      while !@input.eos? do
        skip_white_and_comments
        if @input.check(/\w+/) then
          @tokens << {
            :type => :ident,
            :value => @input.scan(/\w+/)
          }
        elsif @input.check(/[0-9]+/) then
          @tokens << {
            :type => :number,
            :value => eval(@input.scan(/[0-9]+(\.[0-9]*)?/))
          }
        elsif @input.check(/\/\*\*/) then
          @tokens << {
            :type => :doc_comment,
            :value => DocComment.new(@input.scan_until(/\*\//))
          }
        elsif @input.check(/"/) then
          @tokens << {
            :type => :string,
            :value => eval(@input.scan(/"([^\\]|\\.)*"/))
          }
        elsif @input.check(/'/) then
          @tokens << {
            :type => :string,
            :value => eval(@input.scan(/'([^\\]|\\.)*'/))
          }
        elsif @input.check(/\//) then
          if regex? then
            @tokens << {
              :type => :regex,
              :value => @input.scan(/\/([^\\]|\\.)*\/[gim]*/)
            }
          else
            @tokens << {
              :type => :operator,
              :value => @input.scan(/\//)
            }
          end
        elsif @input.check(/./) then
          @tokens << {
            :type => :operator,
            :value => @input.scan(/./)
          }
        end
      end
    end

    # A slash "/" is a division operator if it follows:
    # - identifier
    # - number
    # - closing bracket )
    # - closing square-bracket ]
    # Otherwise it's a beginning of regex
    def regex?
      if @tokens.last then
        type = @tokens.last[:type]
        value = @tokens.last[:value]
        if type == :ident || type == :number || value == ")" || value == "]" then
          return false
        end
      end
      return true
    end

    def skip_white_and_comments
      skip_white
      while multiline_comment? || line_comment? do
        if multiline_comment? then
          @input.scan_until(/\*\/|\Z/)
        elsif line_comment? then
          @input.scan_until(/\n|\Z/)
        end
        skip_white
      end
    end

    def multiline_comment?
      @input.check(/\/\*[^*]/)
    end

    def line_comment?
      @input.check(/\/\//)
    end

    def skip_white
      @input.scan(/\s+/)
    end

  end


  class DocComment
    def initialize(input)
      @current_tag = {:doc => ""}
      @tags = {:default => @current_tag}
      parse(purify(input))
    end

    # Sets the name property of the default at-tag.
    #
    # When name begins with uppercase it's considered to be class
    # name, otherwise a function name.
    #
    # When the name consists of several parts like foo.bar.baz, then
    # the parts should be passed as multiple arguments.
    def set_default_name(*name_chain)
      name = name_chain.last
      tagname = (name[0,1] == name[0,1].upcase) ? :class : :function
      
      if !@tags[:class] && !@tags[:function] then
        @tags[tagname] = {:name => (tagname == :function) ? name : name_chain.join(".")}
        @tags[tagname][:doc] = @tags[:default][:doc]
      end
    end

    # Sets default name for superclass
    def set_default_extends(*name_chain)
      @tags[:class] = {:doc => ""} unless @tags[:class]
      @tags[:class][:extends] = name_chain.join(".") unless @tags[:class][:extends]
    end

    # sets default names and possibly other properties of params
    def set_default_params(params)
      if @tags[:param] then
        0.upto(params.length-1) do |i|
          if @tags[:param][i] then
            params[i].each do |key, val|
              @tags[:param][i][key] = val unless @tags[:param][i][key]
            end
          else
            @tags[:param] << params[i]
          end
        end
      else
        @tags[:param] = params
      end
    end

    def [](tagname)
      @tags[tagname]
    end

    # Extracts content inside /** ... */
    def purify(input)
      result = []
      input.each_line do |line|
        line.chomp!
        if line =~ /\A\/\*\*/ || line =~ /\*\/\Z/ then
          # ignore first and last line
        elsif line =~ /\A\s*\*\s?(.*)\Z/ then
          result << $1
        else
          result << line
        end
      end
      return result.join("\n")
    end

    def parse(input)
      @input = StringScanner.new(input)
      while !@input.eos? do
        if look(/@class\b/) then
          at_class
        elsif look(/@extends\b/) then
          at_extends
        elsif look(/@function\b/) then
          at_function
        elsif look(/@param\b/) then
          at_param
        elsif look(/@return\b/) then
          at_return
        elsif look(/@/) then
          @current_tag[:doc] += @input.scan(/@/)
        elsif look(/[^@]/) then
          @current_tag[:doc] += @input.scan(/[^@]+/)
        end
      end
    end

    # matches @class name ...
    def at_class
      match(/@class/)
      @current_tag = @tags[:class] = {:doc => ""}
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident_chain
      end
      skip_white
    end

    # matches @extends name ...
    def at_extends
      match(/@extends/)
      unless @tags[:class]
        @tags[:class] = {:doc => ""}
      end
      @current_tag = @tags[:class]
      skip_white
      if look(/\w/) then
        @current_tag[:extends] = ident_chain
      end
      skip_white
    end

    # matches @return {type} ...
    def at_function
      match(/@function/)
      @current_tag = @tags[:function] = {:doc => ""}
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
    end

    # matches @param {type} variable ...
    def at_param
      match(/@param/)
      @current_tag = {:doc => ""}
      if @tags[:param] then
        @tags[:param] << @current_tag
      else
        @tags[:param] = [@current_tag]
      end
      skip_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
      skip_white
      if look(/\w/) then
        @current_tag[:name] = ident
      end
      skip_white
    end

    # matches @return {type} ...
    def at_return
      match(/@return/)
      @current_tag = @tags[:return] = {:doc => ""}
      skip_white
      if look(/\{/) then
        @current_tag[:type] = typedef
      end
      skip_white
    end

    # matches {...} and returns text inside brackets
    def typedef
      match(/\{/)
      name = @input.scan(/[^}]+/)
      match(/\}/)
      return name
    end

    # matches chained.identifier.name and returns it
    def ident_chain
      @input.scan(/[\w.]+/)
    end

    # matches identifier and returns its name
    def ident
      @input.scan(/\w+/)
    end

    def look(re)
      @input.check(re)
    end
    
    def match(re)
      @input.scan(re)
    end

    def skip_white
      @input.scan(/\s+/)
    end

    def print
      pp @tags
    end
  end


  class Parser
    def initialize(input)
      @lex = Lexer.new(input)
      @docs = []
    end

    def parse
      while !@lex.empty? do
        if look(:doc_comment) then
          doc = match(:doc_comment)
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

  def JsDuck.parse(input)
    Parser.new(input).parse
  end

end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| d.print; puts}
end

