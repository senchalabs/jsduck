require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  # Implementation of @aside tag.
  #
  # To document members that were present in previous version but are
  # completely gone now.  Other than that it behaves exactly like @deprecated.
  class Aside < JsDuck::MetaTag
    def initialize
      @name = "aside"
      @key = :aside
      @position = :top
      @allowed_types = {
        :guide => true,
        :video => true,
        :example => true,
      }
    end

    def to_value(asides)
      asides.map do |line|
        if line =~ /\A(\w+) +([^ ].*)\Z/
          type = $1.to_sym
          name = $2.strip
          if @allowed_types[type]
            {:type => type, :name => name}
          else
            warn("Unknown @aside type: #{type}")
          end
        else
          warn("Bad syntax: @aside #{line}")
        end
      end.compact
    end

    def to_html(asides)
      asides.map do |aside|
        asset = get_asset(aside[:type], aside[:name])
        if asset
          url = "#!/#{aside[:type]}/#{aside[:name]}"
          heading = aside[:type].to_s.capitalize
          title = asset["title"]
          "<div class='aside #{aside[:type]}'><h4>#{heading}</h4><p><a href='#{url}'>#{title}</a></p></div>"
        else
          warn("Unknown @aside name: #{aside[:type]} #{aside[:name]}")
        end
      end.compact
    end

    def get_asset(type, name)
      case type
        when :guide then @assets.guides[name]
        when :video then @assets.videos[name]
        when :example then @assets.examples[name]
        else nil
      end
    end

    def warn(msg)
      ctx = @context ? @context[:files][0] : {}
      JsDuck::Logger.instance.warn(:aside, msg, ctx[:filename], ctx[:linenr])
      nil
    end

  end
end

