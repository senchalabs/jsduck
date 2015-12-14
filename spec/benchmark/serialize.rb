# Script for benchmarking the Serializer.
#
# Takes bunch of filenames as arguments, runs them all through esprima
# parser and serializes the resulting syntax trees.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/js/esprima'
require 'jsduck/js/serializer'

ARGV.each do |fname|
  ast = JsDuck::Js::Esprima.instance.parse(IO.read(fname))
  JsDuck::Js::Serializer.new.to_s(ast)
end
