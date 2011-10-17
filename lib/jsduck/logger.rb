require 'singleton'
require 'jsduck/os'

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

    # Prints log message with optional filename appended
    def log(msg, filename=nil)
      if @verbose
        puts msg + " " + format(filename) + "..."
      end
    end

    # Prints warning message.
    #
    # Ignores duplicate warnings - only prints the first one.
    # Works best when --processes=0, but it reduces the amount of
    # warnings greatly also when run multiple processes.
    #
    # Optionally filename and line number will be inserted to message.
    def warn(msg, filename=nil, line=nil)
      msg = "Warning: " + format(filename, line) + " " + msg

      if @warnings && !@shown_warnings[msg]
        $stderr.puts msg
        @shown_warnings[msg] = true
      end
    end

    # Formats filename and line number for output
    def format(filename=nil, line=nil)
      out = ""
      if filename
        out = OS::windows? ? filename.gsub('/', '\\') : filename
        if line
          out += ":#{line}:"
        end
      end
      out
    end
  end

end
