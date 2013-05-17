require 'jsduck/tag/tag'

module JsDuck::Tag
  # Base class for all builtin members.
  class MemberTag < Tag
    # Defines a class member type and specifies a name and several
    # other settings.  For example:
    #
    #     {
    #       :name => :event,
    #       :title => "Events",
    #       :position => MEMBER_POS_EVENT,
    #       # The following are optional
    #       :toolbar_title => "Events",
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

    MEMBER_POS_CFG = 1
    MEMBER_POS_PROPERTY = 2
    MEMBER_POS_METHOD = 3
    MEMBER_POS_EVENT = 4
    MEMBER_POS_CSS_VAR = 5
    MEMBER_POS_CSS_MIXIN = 6

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

    # This method defines the signature-line of the member.
    # For example it might return something like this:
    #
    #     "apply(source, target) : Object"
    #
    def to_html(context, cls)
    end

  end
end
