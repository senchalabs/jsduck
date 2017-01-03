require 'jsduck/class'

module JsDuck

  # Expands class docset into one or more docsets.
  #
  # The resulting list can contain the following:
  #
  # - the base class docset itself (always present)
  # - configs detected from comment
  # - constructor detected from comment
  # - members detected from code
  #
  class ClassDocExpander

    # Expands class-docset into multiple docsets.
    def expand(docset)
      @constructor_found = false

      expand_comment(docset) + expand_code(docset)
    end

    private

    # Handles old syntax where configs and constructor are part of class
    # doc-comment.
    #
    # Gathers all tags until first @cfg or @constructor into the first
    # bare :class group.  We have a special case for @xtype which in
    # ExtJS comments often appears after @constructor - so we
    # explicitly place it into :class group.
    #
    # Then gathers each @cfg and tags following it into :cfg group, so
    # that it becomes array of arrays of tags.  This is to allow some
    # configs to be marked with @private or whatever else.
    #
    # Finally gathers tags after @constructor into its group.
    def expand_comment(docset)
      groups = {
        :class => [],
        :cfg => [],
        :constructor => [],
      }

      # By default everything goes to :class group
      group_name = :class

      docset[:comment].each do |tag|
        tagname = tag[:tagname]

        if tagname == :cfg || tagname == :constructor
          group_name = tagname
          if tagname == :cfg && tag[:name] !~ /\./
            groups[:cfg] << []
          end
        end

        if tagname == :alias
          # For backwards compatibility allow @xtype after @constructor
          groups[:class] << tag
        elsif group_name == :cfg
          groups[:cfg].last << tag
        else
          groups[group_name] << tag
        end
      end

      groups_to_docsets(groups, docset)
    end

    # Turns groups hash into list of docsets
    def groups_to_docsets(groups, docset)
      results = []
      results << {
        :tagname => :class,
        :type => docset[:type],
        :comment => groups[:class],
        :code => docset[:code],
        :linenr => docset[:linenr],
      }
      groups[:cfg].each do |cfg|
        results << {
          :tagname => :cfg,
          :type => docset[:type],
          :comment => cfg,
          :code => {},
          :linenr => docset[:linenr],
        }
      end
      if groups[:constructor].length > 0
        # Remember that a constructor is already found and ignore if a
        # constructor is detected from code.
        @constructor_found = true

        results << {
          :tagname => :method,
          :type => docset[:type],
          :comment => groups[:constructor],
          :code => {},
          :linenr => docset[:linenr],
        }
      end
      results
    end

    # Turns auto-detected class members into docsets in their own
    # right.
    def expand_code(docset)
      results = []

      if docset[:code]
        (docset[:code][:members] || []).each do |m|
          results << code_to_docset(m) unless @constructor_found && JsDuck::Class.constructor?(m)
        end
      end

      results
    end

    def code_to_docset(m)
      return {
        :tagname => m[:tagname],
        :type => :no_comment,
        :comment => [],
        :code => m,
        :linenr => m[:linenr],
      }
    end

  end

end
