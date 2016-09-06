require 'jsduck/tag/tag'
require 'jsduck/render/signature_util'

module JsDuck::Tag
  # Base class for all builtin members.
  class MemberTag < Tag
    # Defines a class member type and specifies various settings.  For
    # example:
    #
    #     {
    #       :title => "Events",
    #       :position => MEMBER_POS_EVENT,
    #       # The following are optional
    #       :toolbar_title => "Events",
    #       :icon => File.dirname(__FILE__) + "/icons/event.png",
    #       :subsections => [
    #         {:title => "Static events",
    #          :filter => {:static => false},
    #          :default => true},
    #         {:title => "Instance events",
    #          :filter => {:static => true}},
    #       ]
    #     }
    #
    # Position defines the ordering of member section in final HTML
    # output.
    #
    # Title is shown at the top of each such section and also as a
    # label on Docs app toolbar button unless :toolbar_title is
    # specified.
    #
    # Icon defines a file to be used as member icon in various places
    # of the docs app.
    #
    # Subsections allows splitting the list of members to several
    # subgroups.  For example methods get split into static and
    # instance methods.
    #
    # - The :filter field defines how to filter out the members for
    #   this subcategory.  :static=>true filters out all members that
    #   have a :static field with a truthy value.  Conversely,
    #   :static=>false filters out members not having a :static field
    #   or having it with a falsy value.
    #
    # - Setting :default=>true will hide the subsection title when all
    #   the members end up in that subsection.  For example when there
    #   are only instance methods, the docs will only contain the
    #   section title "Methods", as by default one should assume all
    #   methods are instance methods if not stated otherwise.
    #
    attr_reader :member_type

    # Avoid already-defined-constant warnings in Ruby 1.8
    unless defined?(MEMBER_POS_CFG)
      MEMBER_POS_CFG = 1
      MEMBER_POS_PROPERTY = 2
      MEMBER_POS_METHOD = 3
      MEMBER_POS_EVENT = 4
      MEMBER_POS_CSS_VAR = 5
      MEMBER_POS_CSS_MIXIN = 6
	  MEMBER_POS_LISTENER = 7
    end

    # Extracts the fields auto-detected from code that are relevant to
    # the member type and returns a hash with them.
    #
    # The implementation here extracts fields applicable to all member
    # types.  When additional member-specific fields are to be
    # extracted, override this method, but be sure to call the
    # superclass method too.
    #
    # For example inside Method tag we might additionally want to
    # extract :type and :default:
    #
    #     def process_code(code)
    #       h = super(code)
    #       h[:type] = code[:type]
    #       h[:default] = code[:default]
    #       h
    #     end
    #
    def process_code(code)
      return {
        :tagname => code[:tagname],
        # An auto-detected name might be "MyClass.prototype.myMethod" -
        # for member name we only want the last "myMethod" part.
        :name => code[:name] ? code[:name].split(/\./).last : nil,

        :autodetected => code[:autodetected],
        :inheritdoc => code[:inheritdoc],
        :static => code[:static],
        :private => code[:private],
        :inheritable => code[:inheritable],
        :linenr => code[:linenr],
      }
    end

    # Merges documentation and code hashes into the result hash.
    def merge(hash, docs, code)
    end

    # This method defines the signature-line of the member.
    # For example it might return something like this:
    #
    #     "apply(source, target) : Object"
    #
    # Use #member_link method to render the member name as link in a
    # standard way.  Similarly there's helper method #member_params
    # for rendering the parameter list.
    def to_html(context, cls)
    end

    # Creates HTML link to the given member.
    # A helper method for use in #to_html.
    def member_link(member)
      JsDuck::Render::SignatureUtil::link(member[:owner], member[:id], member[:name])
    end

    # Creates HTML listing of parameters.
    # When called with nil, creates empty params list.
    # A helper method for use in #to_html.
    def member_params(params)
      ps = Array(params).map do |p|
        p[:optional] ? "[#{p[:name]}]" : p[:name]
      end.join(", ")

      "( <span class='pre'>#{ps}</span> )"
    end

  end
end
