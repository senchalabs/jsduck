require 'jsduck/warning/nodoc'

module JsDuck
  module Warning

    # Warnings management
    class Registry

      def initialize
        @docs = [
          [:global, "Member doesn't belong to any class"],
          [:inheritdoc, "@inheritdoc referring to unknown class or member"],
          [:extend, "@extend/mixin/requires/uses referring to unknown class"],
          [:tag, "Use of unsupported @tag"],
          [:tag_repeated, "An @tag used multiple times, but only once allowed"],
          [:tag_syntax, "@tag syntax error"],
          [:link, "{@link} to unknown class or member"],
          [:link_ambiguous, "{@link} is ambiguous"],
          [:link_auto, "Auto-detected link to unknown class or member"],
          [:html, "Unclosed HTML tag"],

          [:alt_name, "Name used as both classname and alternate classname"],
          [:name_missing, "Member or parameter has no name"],
          [:dup_param, "Method has two parameters with the same name"],
          [:dup_member, "Class has two members with the same name"],
          [:req_after_opt, "Required parameter comes after optional"],
          [:param_count, "Less parameters documented than detected from code"],
          [:subproperty, "@param foo.bar where foo param doesn't exist"],
          [:sing_static, "Singleton class member marked as @static"],
          [:type_syntax, "Syntax error in {type definition}"],
          [:type_name, "Unknown type referenced in {type definition}"],
          [:enum, "Enum with invalid values or no values at all"],
          [:fires, "@fires references unknown event"],

          [:image, "{@img} referring to missing file"],
          [:image_unused, "An image exists in --images dir that's not used"],
          [:cat_old_format, "Categories file uses old deprecated format"],
          [:cat_no_match, "Class pattern in categories file matches nothing"],
          [:cat_class_missing, "Class is missing from categories file"],
          [:guide, "Guide is missing from --guides dir"],

          [:aside, "Problem with @aside tag"],
          [:hide, "Problem with @hide tag"],

          [:nodoc, "Missing documentation"],
        ]

        @deprecated = {
          :no_doc => {:msg => "Alias for +nodoc(class,public)", :params => [:class, :public]},
          :no_doc_member => {:msg => "Alias for +nodoc(member,public)", :params => [:member, :public]},
          :no_doc_param => {:msg => "Alias for +nodoc(param,public)", :params => [:param, :public]},
        }

        @nodoc = Warning::Nodoc.new

        # Turn off all warnings by default.
        # This is good for testing.
        # When running JSDuck app, the Options class enables most warnings.
        @warnings = {}
        @docs.each do |w|
          @warnings[w[0]] = {:enabled => false, :patterns => []}
        end
      end

      # Enables or disables a particular warning
      # or all warnings when type == :all.
      # Additionally a filename pattern can be specified.
      def set(type, enabled, pattern=nil, params=[])
        if type == :all
          # When used with a pattern, only add the pattern to the rules
          # where it can have an effect - otherwise we get a warning.
          @warnings.each_key do |key|
            set(key, enabled, pattern) unless pattern && @warnings[key][:enabled] == enabled
          end
        elsif type == :nodoc
          @nodoc.set(enabled, params[0], params[1], pattern)
        elsif @deprecated[type]
          params = @deprecated[type][:params]
          @nodoc.set(enabled, params[0], params[1], pattern)
        elsif @warnings.has_key?(type)
          if pattern
            if @warnings[type][:enabled] == enabled
              raise "Warning rule '#{enabled ? '+' : '-'}#{type}:#{pattern}' has no effect"
            else
              @warnings[type][:patterns] << Regexp.new(Regexp.escape(pattern))
            end
          else
            @warnings[type] = {:enabled => enabled, :patterns => []}
          end
        else
          raise "Warning of type '#{type}' doesn't exist"
        end
      end

      # get documentation for all warnings
      def doc
        @docs.map {|w| " #{@warnings[w[0]][:enabled] ? '+' : '-'}#{w[0]} - #{w[1]}" }
      end

      # True when the warning is enabled for the given type and filename
      # combination.
      def enabled?(type, filename, params=[])
        if type == :nodoc
          return @nodoc.enabled?(params[0], params[1], filename)
        end

        rule = @warnings[type]
        if rule[:patterns].any? {|re| filename =~ re }
          !rule[:enabled]
        else
          rule[:enabled]
        end
      end

      def has?(type)
        @warnings.has_key?(type)
      end

    end

  end
end
