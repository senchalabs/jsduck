require 'jsduck/util/singleton'
require 'jsduck/util/os'
require 'jsduck/warning/registry'

module JsDuck

  # Central logging of JsDuck
  class Logger
    include Util::Singleton

    # Set to true to enable verbose logging
    attr_accessor :verbose

    # Set true to force colored output.
    # Set false to force no colors.
    attr_accessor :colors

    def initialize
      @verbose = false
      @colors = nil

      @warnings = Warning::Registry.new

      @shown_warnings = {}
    end

    # Prints log message with optional filename appended
    def log(msg, filename=nil)
      if @verbose
        $stderr.puts paint(:green, msg) + " " + format(filename) + " ..."
      end
    end

    # Enables or disables a particular warning
    # or all warnings when type == :all.
    # Additionally a filename pattern can be specified.
    def set_warning(type, enabled, pattern=nil, params=[])
      begin
        @warnings.set(type, enabled, pattern, params)
      rescue Exception => e
        warn(nil, e.message)
      end
    end

    # get documentation for all warnings
    def doc_warnings
      @warnings.doc
    end

    # Prints warning message.
    #
    # The type must be one of predefined warning types which can be
    # toggled on/off with command-line options, or it can be nil, in
    # which case the warning is always shown.
    #
    # Ignores duplicate warnings - only prints the first one.
    # Works best when --processes=0, but it reduces the amount of
    # warnings greatly also when run multiple processes.
    #
    # Optionally filename and line number will be inserted to message.
    # These two last arguments can also be supplied as one hash of:
    #
    #     {:filename => "foo.js", :linenr => 17}
    #
    def warn(type, msg, filename=nil, line=nil)
      if filename.is_a?(Hash)
        line = filename[:linenr]
        filename = filename[:filename]
      end

      if warning_enabled?(type, filename)
        print_warning(msg, filename, line)
      end

      return false
    end

    # Prints :nodoc warning message.
    #
    # Because the :nodoc warning needs different parameters, for now
    # we're using a separate method specially for these.
    def warn_nodoc(type, visibility, msg, file)
      filename = file[:filename]
      line = file[:linenr]

      if @warnings.enabled?(:nodoc, filename, [type, visibility])
        print_warning(msg, filename, line)
      end
    end

    # Prints fatal error message with backtrace.
    # The error param should be $! from resque block.
    def fatal(msg)
      $stderr.puts paint(:red, "Error: ") + msg
    end

    # Prints fatal error message with backtrace.
    # The error param should be $! from resque block.
    def fatal_backtrace(msg, error)
      $stderr.puts paint(:red, "Error: ") + "#{msg}: #{error}"
      $stderr.puts
      $stderr.puts "Here's a full backtrace:"
      $stderr.puts error.backtrace
    end

    # True when at least one warning was logged.
    def warnings_logged?
      @shown_warnings.length > 0
    end

    private

    COLORS = {
      :black   => "\e[30m",
      :red     => "\e[31m",
      :green   => "\e[32m",
      :yellow  => "\e[33m",
      :blue    => "\e[34m",
      :magenta => "\e[35m",
      :cyan    => "\e[36m",
      :white   => "\e[37m",
    }

    CLEAR = "\e[0m"

    def warning_enabled?(type, filename)
      if type == nil
        true
      elsif !@warnings.has?(type)
        warn(nil, "Unknown warning type #{type}")
      else
        @warnings.enabled?(type, filename)
      end
    end

    def print_warning(msg, filename, line)
      warning = paint(:yellow, "Warning: ") + format(filename, line) + " " + msg

      if !@shown_warnings[warning]
        $stderr.puts warning
        @shown_warnings[warning] = true
      end
    end

    # Formats filename and line number for output
    def format(filename=nil, line=nil)
      out = ""
      if filename
        out = Util::OS.windows? ? filename.gsub('/', '\\') : filename
        if line
          out += ":#{line}:"
        end
      end
      paint(:magenta, out)
    end

    # Helper for doing colored output in UNIX terminal
    #
    # Only does color output when STDERR is attached to TTY
    # i.e. is not piped/redirected.
    def paint(color_name, msg)
      if @colors == false || @colors == nil && (Util::OS.windows? || !$stderr.tty?)
        msg
      else
        COLORS[color_name] + msg + CLEAR
      end
    end
  end

end
