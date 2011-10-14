# This file implements hidden @author and @docauthor tags.
#
# It's included by default when no other file specified with --meta-tags option.
#
require "jsduck/meta_tag"

class JsDuck::AuthorTag < JsDuck::MetaTag
  def initialize
    @name = "author"
  end
end

class JsDuck::DocAuthorTag < JsDuck::MetaTag
  def initialize
    @name = "docauthor"
  end
end
