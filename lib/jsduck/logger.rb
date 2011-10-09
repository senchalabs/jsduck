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
    #
    # Optionally filename and line number will be inserted to message.
    def warn(msg, filename=nil, line=0)
      msg = filename ? "#{filename}:#{line}: #{msg}" : msg
      if @warnings && !@shown_warnings[msg]
        $stderr.puts msg
        @shown_warnings[msg] = true
      end
    end
  end

end
