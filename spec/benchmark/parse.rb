# Script for benchmarking JavaScript parser.
#
# Takes bunch of filenames as arguments and runs them all through Js::Parser.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/js/parser'

ARGV.each do |fname|
  JsDuck::Js::Parser.new(IO.read(fname)).parse
end
