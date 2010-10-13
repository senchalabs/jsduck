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
        elsif @input.check(/./) then
          @tokens << {
            :type => :operator,
            :value => @input.scan(/./)
          }
        end
      end
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
        if @lex.look(:doc_comment) then
          doc = @lex.next
          if @lex.look("function", :ident) then
            @lex.next
            # function name(){
            doc.set_default_name(@lex.next)
            doc.set_default_params(parse_params)
          elsif @lex.look("var", :ident, "=", "function") then
            @lex.next
            # var name = function(){
            doc.set_default_name(@lex.next)
            @lex.next # =
            doc.set_default_params(parse_anonymous_function_params)
          elsif @lex.look(:ident, "=", "function") ||
              @lex.look(:ident, ":", "function") ||
              @lex.look(:string, ":", "function") then
            # name: function(){
            doc.set_default_name(@lex.next)
            @lex.next # : or =
            doc.set_default_params(parse_anonymous_function_params)
          elsif @lex.look(:ident, ".") then
            # some.long.prototype.chain = function() {
            name_chain = [@lex.next]
            while @lex.look(".", :ident) do
              @lex.next
              name_chain << @lex.next
              if @lex.look("=", "function") then
                doc.set_default_name(*name_chain)
                @lex.next # =
                doc.set_default_params(parse_anonymous_function_params)
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

    # Parses function parameters out of:  function blah(x, y, z) {...
    def parse_anonymous_function_params
      if @lex.look("function") then
        @lex.next # function
        @lex.next if @lex.look(:ident) # optional anonymous function name
        parse_params
      else
        []
      end
    end

    # Parses parameters out of:  (x, y, z, ...)
    def parse_params
      params = []
      if @lex.look("(") then
        @lex.next
        while @lex.look(:ident) do
          params << {:name => @lex.next}
          if @lex.look(",") then
            @lex.next
          else
            break
          end
        end
      end
      params
    end
  end


  def JsDuck.parse(input)
    Parser.new(input).parse
  end

end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| d.print; puts}
end

