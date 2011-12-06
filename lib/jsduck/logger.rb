require 'singleton'
require 'jsduck/os'

module JsDuck

  # Central logging of JsDuck
  class Logger
    include Singleton

    # Set to true to enable verbose logging
    attr_accessor :verbose

    def initialize
      @verbose = false
      @warning_docs = [
        [:global, "Member doesn't belong to any class"],
        [:inheritdoc, "@inheritdoc referring to unknown class or member"],
        [:extend, "@extend or @mixin referring to unknown class"],
        [:link, "{@link} to unknown class or member"],
        [:link_private, "{@link} to private member"],
        [:link_ambiguous, "{@link} is ambiguous"],
        [:link_auto, "Auto-detected link to unknown class or member"],

        [:alt_name, "Name used as both classname and alternate classname"],
        [:name_missing, "Member or parameter has no name"],
        [:no_doc, "Member or class without documentation"],
        [:dup_param, "Method has two parameters with same name"],
        [:req_after_opt, "Required parameter comes after optional"],
        [:subproperty, "@param foo.bar where foo param doesn't exist"],
        [:sing_static, "Singleton class member marked as @static"],
        [:type_syntax, "Syntax error in {type definition}"],
        [:type_name, "Unknown type referenced in {type definition}"],

        [:image, "{@img} referring to missing file"],
        [:image_unused, "An image exists in --images dir that's not used"],
        [:cat_old_format, "Categories file uses old deprecated format"],
        [:cat_no_match, "Class pattern in categories file matches nothing"],
        [:cat_class_missing, "Class is missing from categories file"],
        [:guide, "Guide is missing from --guides dir"],
      ]
      # Turn on all warnings except :link_auto
      @warnings = {}
      @warning_docs.each do |w|
        @warnings[w[0]] = true
      end
      set_warning(:link_auto, false)

      @shown_warnings = {}
    end

    # Prints log message with optional filename appended
    def log(msg, filename=nil)
      if @verbose
        puts msg + " " + format(filename) + "..."
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
        warn(nil, "Warning of type '#{type} doesn't exist")
      end
    end

    # get documentation for all warnings
    def doc_warnings
      @warning_docs.map {|w| " #{@warnings[w[0]] ? '+' : '-'}#{w[0]} - #{w[1]}" } + [" "]
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
      msg = "Warning: " + format(filename, line) + " " + msg

      if type == nil || @warnings[type]
        if !@shown_warnings[msg]
          $stderr.puts msg
          @shown_warnings[msg] = true
        end
      elsif !@warnings.has_key?(type)
        warn(nil, "Unknown warning type #{type}")
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
