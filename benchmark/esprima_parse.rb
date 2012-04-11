# Script for benchmarking the lexer.
#
# Takes bunch of filenames as arguments and runs them all through lexer.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/esprima_parser'

ARGV.each do |fname|
  JsDuck::EsprimaParser.instance.parse(IO.read(fname))
end

