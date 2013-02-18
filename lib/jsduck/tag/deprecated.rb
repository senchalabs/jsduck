require "jsduck/tag/deprecated_tag"

module JsDuck::Tag
  class Deprecated < DeprecatedTag
    def initialize
      @tagname = :deprecated
      @css = ".signature .deprecated { background-color: #aa0000 }" # red
      super
    end
  end
end
