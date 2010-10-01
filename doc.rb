#!/usr/bin/env ruby
require 'strscan'

class Lexer
  def initialize(input)
    @input = StringScanner.new(input)
  end

  def scan
    if keyword? then
      @input.scan(/\w+/)
    elsif doc_comment? then
      @input.scan_until(/\*\//)
    elsif operator? then
      @input.scan(/./)
    else
      nil
    end
  end

  def keyword?
    skip_white_and_comments
    @input.check(/\w+/)
  end

  def operator?
    skip_white_and_comments
    @input.check(/\W/)
  end

  def doc_comment?
    skip_white_and_comments
    @input.check(/\/\*\*/)
  end

  def eos?
    skip_white_and_comments
    @input.eos?
  end

  def check(re)
    skip_white_and_comments
    @input.check(re)
  end

  def scan_if(re)
    skip_white_and_comments
    if @input.check(re) then
      scan
    else
      nil
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
while !lex.eos? do
  if lex.doc_comment? then
    puts lex.scan
    if lex.scan_if(/function/) && lex.keyword? then
      # function name(){
      puts "function " + lex.scan
    elsif lex.scan_if(/var/) && lex.keyword? && (fname = lex.scan) && lex.scan_if(/=/) && lex.scan_if(/function/) then
      # var name = function(){
      puts "function " + fname
    elsif lex.keyword? && (fname = lex.scan) && lex.scan_if(/:/) && lex.scan_if(/function/) then
      # name: function(){
      puts "function " + fname
    end
  else
    lex.scan
  end
end

