# Script for benchmarking the lexer.
#
# Takes bunch of filenames as arguments and runs them all through lexer.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/esprima_tokenizer'

ARGV.each do |fname|
  JsDuck::EsprimaTokenizer.instance.tokenize(IO.read(fname))
end

