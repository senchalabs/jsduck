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
            :type => :keyword,
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
    attr_accessor :function, :doc
    
    def initialize(input)
      @function = ""
      @doc = ""
      @params = []
      @return = "void"
      parse(purify(input))
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
      doc = []
      input.each_line do |line|
        line.chomp!
        if line =~ /\A@param\b/ then
          @params << line
        elsif line =~ /\A@return\b/ then
          @return = line
        else
          doc << line
        end
      end
      @doc = doc.join("\n")
    end

    def print
      puts "function: " + @function
      puts "doc: " + @doc
      puts "params: " + @params.join("\n")
      puts "return: " + @return
    end
  end


  def JsDuck.parse(input)
    lex = Lexer.new(input)
    docs = []
    while !lex.empty? do
      if lex.look(:doc_comment) then
        doc = lex.next
        if lex.look("function", :keyword) then
          lex.next
          # function name(){
          doc.function = lex.next
        elsif lex.look("var", :keyword, "=", "function") then
          lex.next
          # var name = function(){
          doc.function = lex.next
        elsif lex.look(:keyword, "=", "function") ||
            lex.look(:keyword, ":", "function") ||
            lex.look(:string, ":", "function") then
          # name: function(){
          doc.function = lex.next
        end
        docs << doc
      else
        lex.next
      end
    end
    return docs
  end

end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| d.print; puts}
end

