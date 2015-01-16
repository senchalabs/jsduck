require "jsduck/meta_tag"

class EditURLTag < JsDuck::MetaTag
  def initialize
    # This defines the name of the @tag
    @name = "editurl"
    @key = :editurl
  end

  def to_value(contents)
    contents[0]
  end

end