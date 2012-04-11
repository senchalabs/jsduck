# Script for benchmarking the lexer.
#
# Takes bunch of filenames as arguments and runs them all through lexer.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/js_parser'

ARGV.each do |fname|
  JsDuck::JsParser.new(IO.read(fname)).parse
end

