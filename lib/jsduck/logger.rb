require 'jsduck/util/singleton'
require 'jsduck/util/os'

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

      @warning_docs = [
        [:global, "Member doesn't belong to any class"],
        [:inheritdoc, "@inheritdoc referring to unknown class or member"],
        [:extend, "@extend/mixin/requires/uses referring to unknown class"],
        [:tag, "Use of unsupported @tag"],
        [:link, "{@link} to unknown class or member"],
        [:link_ambiguous, "{@link} is ambiguous"],
        [:link_auto, "Auto-detected link to unknown class or member"],
        [:html, "Unclosed HTML tag."],

        [:alt_name, "Name used as both classname and alternate classname"],
        [:name_missing, "Member or parameter has no name"],
        [:no_doc, "Member or class without documentation"],
        [:dup_param, "Method has two parameters with the same name"],
        [:dup_member, "Class has two members with the same name"],
        [:req_after_opt, "Required parameter comes after optional"],
        [:subproperty, "@param foo.bar where foo param doesn't exist"],
        [:sing_static, "Singleton class member marked as @static"],
        [:type_syntax, "Syntax error in {type definition}"],
        [:type_name, "Unknown type referenced in {type definition}"],
        [:enum, "Enum defined without any values in it"],

        [:image, "{@img} referring to missing file"],
        [:image_unused, "An image exists in --images dir that's not used"],
        [:cat_old_format, "Categories file uses old deprecated format"],
        [:cat_no_match, "Class pattern in categories file matches nothing"],
        [:cat_class_missing, "Class is missing from categories file"],
        [:guide, "Guide is missing from --guides dir"],

        [:aside, "Problem with @aside tag"],
        [:hide, "Problem with @hide tag"],
      ]
      # Turn off all warnings by default.
      # This is good for testing.
      # When running JSDuck app, the Options class enables most warnings.
      @warnings = {}
      @warning_docs.each do |w|
        @warnings[w[0]] = false
      end

      @shown_warnings = {}
    end

    # Prints log message with optional filename appended
    def log(msg, filename=nil)
      if @verbose
        $stderr.puts paint(:green, msg) + " " + format(filename) + " ..."
      end
    end

    # Enabled or disables a particular warning
    # or all warnings when type == :all
    def set_warning(type, enabled)
      if type == :all
        @warnings.each_key do |key|
          @warnings[key] = enabled
        end
      elsif @warnings.has_key?(type)
        @warnings[type] = enabled
      else
        warn(nil, "Warning of type '#{type}' doesn't exist")
      end
    end

    # get documentation for all warnings
    def doc_warnings
      @warning_docs.map {|w| " #{@warnings[w[0]] ? '+' : '-'}#{w[0]} - #{w[1]}" }
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
    def warn(type, msg, filename=nil, line=nil)
      msg = paint(:yellow, "Warning: ") + format(filename, line) + " " + msg

      if type == nil || @warnings[type]
        if !@shown_warnings[msg]
          $stderr.puts msg
          @shown_warnings[msg] = true
        end
      elsif !@warnings.has_key?(type)
        warn(nil, "Unknown warning type #{type}")
      end

      return false
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
