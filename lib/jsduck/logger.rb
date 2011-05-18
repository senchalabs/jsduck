require 'singleton'

module JsDuck

  class Logger
    include Singleton

    attr_accessor :verbose
    attr_accessor :warnings

    def initialize
      @verbose = false
      @warnings = true
    end

    # Prints log message
    def log(msg)
      puts msg if @verbose
    end

    # Prints warning message
    def warn(msg)
      puts "Warning: " + msg if @warnings
    end
  end

end
