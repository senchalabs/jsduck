require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  # Implementation of @aside tag.
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
        type = aside[:type]
        name = aside[:name]
        assets_group = get_assets_group(type)
        asset = assets_group[name]
        if asset
          url = "#!/#{type}/#{name}"
          heading = type.to_s.capitalize
          title = asset["title"]
          icon_url = assets_group.icon_url(asset)
          <<-EOHTML
            <div class='aside #{type}'>
              <h4>#{heading}</h4>
              <p><a href='#{url}'><img src='#{icon_url}' alt=''> #{title}</a></p>
            </div>
          EOHTML
        else
          warn("Unknown @aside name: #{type} #{name}")
        end
      end.compact
    end

    def get_assets_group(type)
      case type
      when :guide then @assets.guides
      when :video then @assets.videos
      when :example then @assets.examples
      else {}
      end
    end

    def warn(msg)
      ctx = @context ? @context[:files][0] : {}
      JsDuck::Logger.warn(:aside, msg, ctx[:filename], ctx[:linenr])
      nil
    end

  end
end

