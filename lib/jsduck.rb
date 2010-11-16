$:.unshift File.dirname(__FILE__) # For running the actual JsDuck app

require 'jsduck/lexer'
require 'jsduck/parser'
require 'jsduck/doc_comment_parser'
require 'jsduck/merger'

require 'pp'

module JsDuck
  def JsDuck.parse(input)
    doc_parser = DocCommentParser.new
    merger = Merger.new
    documentation = []
    current_class = nil

    Parser.new(input).parse.each do |docset|
      node = merger.merge(doc_parser.parse(docset[:comment]), docset[:code])
      # all methods, cfgs, ... following a class will be added to that class
      if node[:tagname] == :class
        current_class = node
        documentation << node
      elsif current_class
        current_class[ node[:tagname] ] << node
      else
        documentation << node
      end
    end

    documentation
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| pp d; puts}
end

