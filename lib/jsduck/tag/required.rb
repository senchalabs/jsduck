require "jsduck/meta_tag"

module JsDuck::Tag
  # There is no @required tag.
  # Instead the :required attribute is detected after @cfg:
  #
  #    @cfg {Type} someName (required)
  #
  # This class is only used for displaying the required attribute, not
  # for detecting it.  The detection is done with custom logic in
  # DocParser and Merger classes.
  class Required < JsDuck::MetaTag
    def initialize
      @name = "--non-matching-requried-tag--"
      @key = :required
      @signature = {:long => "required", :short => "REQ"}
      @boolean = true
    end
  end
end

