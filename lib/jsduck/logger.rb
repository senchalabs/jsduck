require 'singleton'

module JsDuck

  # Central logging of JsDuck
  class Logger
    include Singleton

    attr_accessor :verbose
    attr_accessor :warnings

    def initialize
      @verbose = false
      @warnings = true
      @shown_warnings = {}
    end

    # Prints log message
    def log(msg)
      puts msg if @verbose
    end

    # Prints warning message.
    #
    # Ignores duplicate warnings - only prints the first one.
    # Works best when --processes=0, but it reduces the amount of
    # warnings greatly also when run multiple processes.
    def warn(msg)
      if @warnings && !@shown_warnings[msg]
        $stderr.puts "Warning: " + msg
        @shown_warnings[msg] = true
      end
    end
  end

end
