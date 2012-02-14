require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @aside tag.
  #
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like @deprecated.
  class Aside < JsDuck::MetaTag
    def initialize
      @name = "aside"
      @key = :aside
      @types = {
        "guide" => true,
        "video" => true,
        "example" => true,
      }
    end

    def to_value(asides)
      asides.map do |line|
        if line =~ /\A(\w+) +([^ ].*)\Z/
          if @types[$1]
            {:type => $1, :name => $2.strip}
          else
            warn("Unknown @aside type: #{$1}")
          end
        else
          warn("Bad syntax: @aside #{line}")
        end
      end.compact
    end

    def warn(msg)
      Logger.instance.warn(nil, msg)
      nil
    end

    def to_html(asides)
      asides.map do |aside|
        url = "#!/#{aside[:type]}/#{aside[:name]}"
        title = aside[:name]
        "<div>#{aside[:type]}: <a href='#{url}'>#{title}</a></div>"
      end
    end
  end
end

