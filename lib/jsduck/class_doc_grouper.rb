module JsDuck

  # Handles old syntax where configs and constructor are part of class
  # doc-comment.
  class ClassDocGrouper

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
    def self.group(docs)
      groups = {
        :class => [],
        :cfg => [],
        :constructor => [],
      }

      # By default everything goes to :class group
      group_name = :class

      docs.each do |tag|
        tagname = tag[:tagname]

        if tagname == :cfg || tagname == :constructor
          group_name = tagname
          if tagname == :cfg
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

      groups
    end

  end

end
