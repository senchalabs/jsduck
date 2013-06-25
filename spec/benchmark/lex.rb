# Script for benchmarking CSS lexer.
#
# Takes bunch of filenames as arguments and runs them all through CSS Lexer.
#
$:.unshift File.dirname(File.dirname(File.dirname(__FILE__))) + "/lib"
require 'jsduck/css_lexer'

def lex(str)
  lexer = JsDuck::CssLexer.new(str)
  tokens = []
  while !lexer.empty?
    tokens << lexer.next
  end
  tokens
end

ARGV.each do |fname|
  lex(IO.read(fname))
end
