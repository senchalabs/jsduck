# Script for benchmarking the Serializer.
#
# Takes bunch of filenames as arguments, runs them all through esprima
# parser and serializes the resulting syntax trees.
#
$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"
require 'jsduck/esprima'
require 'jsduck/serializer'

ARGV.each do |fname|
  ast = JsDuck::Esprima.instance.parse(IO.read(fname))
  JsDuck::Serializer.new.to_s(ast)
end

