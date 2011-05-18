require 'singleton'

module JsDuck

  class Logger
    include Singleton

    attr_accessor :warnings

    def initialize
      @warnings = true
    end

    # Prints warning message
    def warn(msg)
      puts "Warning: " + msg if @warnings
    end
  end

end
