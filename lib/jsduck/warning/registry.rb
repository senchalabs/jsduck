require 'jsduck/warning/basic'
require 'jsduck/warning/nodoc'
require 'jsduck/warning/tag'
require 'jsduck/warning/deprecated'
require 'jsduck/warning/all'
require 'jsduck/warning/warn_exception'

module JsDuck
  module Warning

    # Warnings management
    class Registry

      def initialize
        @warnings = []
        @warnings_map = {}

        # Basic warnings
        [
          [:global, "Member doesn't belong to any class"],
          [:inheritdoc, "@inheritdoc referring to unknown class or member"],
          [:extend, "@extend/mixin/requires/uses referring to unknown class"],
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
          [:cat_no_match, "Class pattern in categories file matches nothing"],
          [:cat_class_missing, "Class is missing from categories file"],
          [:guide, "Guide is missing from --guides dir"],

          [:aside, "Problem with @aside tag"],
          [:hide, "Problem with @hide tag"],
        ].each do |w|
          register(w[0], Warning::Basic.new(w[0], w[1]))
        end

        # :tag warning
        register(:tag, Warning::Tag.new)

        # :nodoc warning
        register(:nodoc, Warning::Nodoc.new)

        # :all warning (encompasses all other warning types)
        register(:all, Warning::All.new(@warnings.clone))

        # :deprecated warnings (linking to :nodoc warning)
        [
          {:type => :no_doc, :msg => "Alias for nodoc(class,public)", :params => [:class, :public]},
          {:type => :no_doc_member, :msg => "Alias for nodoc(member,public)", :params => [:member, :public]},
          {:type => :no_doc_param, :msg => "Alias for nodoc(param,public)", :params => [:param, :public]},
        ].each do |w|
          register(w[:type], Warning::Deprecated.new(w[:type], w[:msg], @warnings_map[:nodoc], w[:params]))
        end

      end

      def register(type, warning)
        @warnings << warning
        @warnings_map[type] = warning
      end

      # Enables or disables a particular warning type.
      # Additionally a filename pattern and params for the warning can be specified.
      def set(type, enabled, path_pattern=nil, params=[])
        if @warnings_map[type]
          @warnings_map[type].set(enabled, path_pattern, params)
        else
          raise WarnException, "Warning of type '#{type}' doesn't exist"
        end
      end

      # get documentation for all warnings
      def doc
        @warnings.map {|w| w.doc }.compact.flatten
      end

      # True when the warning is enabled for the given type and
      # filename combination.
      def enabled?(type, filename, params=[])
        @warnings_map[type].enabled?(filename, params)
      end

      def has?(type)
        @warnings_map.has_key?(type)
      end

    end

  end
end
