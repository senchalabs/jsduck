$:.unshift File.dirname(__FILE__) # For running the actual JsDuck app

require 'jsduck/lexer'
require 'jsduck/doc_comment'
require 'jsduck/doc_comment_parser'
require 'jsduck/parser'

require 'pp'

module JsDuck
  def JsDuck.parse(input)
    Parser.new(input).parse
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| pp d; puts}
end

