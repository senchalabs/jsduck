require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  # Implementation of @since tag.
  class Since < JsDuck::MetaTag
    def initialize
      @name = "since"
      @key = :since
    end

    def to_value(contents)
      if contents.length > 1
        JsDuck::Logger.warn(nil, "Only one @since tag allowed per class/member.")
      end
      contents[0]
    end

    def to_html(version)
      <<-EOHTML
        <p>Available since: <b>#{version}</b></p>
      EOHTML
    end
  end
end

