#!/usr/bin/env ruby
require 'parser'
require 'pp'

module JsDuck
  def JsDuck.parse(input)
    Parser.new(input).parse
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| pp d; puts}
end

