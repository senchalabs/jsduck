#!/usr/bin/env ruby
require 'parser'

module JsDuck
  def JsDuck.parse(input)
    Parser.new(input).parse
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| d.print; puts}
end

