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

    Parser.new(input).parse.each do |docset|
      documentation << merger.merge(doc_parser.parse(docset[:comment]), docset[:code])
    end

    documentation
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| pp d; puts}
end

