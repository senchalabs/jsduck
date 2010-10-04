#!/usr/bin/env ruby
require 'strscan'
require 'pp'

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
          :value => @input.scan_until(/\*\//)
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
        @input.scan_until(/\*\//)
      elsif line_comment? then
        @input.scan_until(/\n/)
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


lex = Lexer.new($stdin.read)
while !lex.empty? do
  if lex.look(:doc_comment) then
    puts lex.next
    if lex.look("function", :keyword) then
      lex.next
      # function name(){
      puts "function " + lex.next
    elsif lex.look("var", :keyword, "=", "function") then
      lex.next
      # var name = function(){
      puts "function " + lex.next
    elsif lex.look(:keyword, ":", "function") then
      # name: function(){
      puts "function " + lex.next
    end
  else
    lex.next
  end
end
