require "jsduck/tag/tag"
require "jsduck/logger"

module JsDuck::Tag
  class Aside < Tag
    def initialize
      @pattern = "aside"
      @tagname = :aside
      @html_position = POS_ASIDE
    end

    # Parses: @aside [ guide | video| example ] name
    def parse_doc(p, pos)
      {
        :tagname => :aside,
        :type => aside_type(p),
        :name => p.hw.ident,
      }
    end

    def aside_type(p)
      p.look(/\w+/) ? p.ident.to_sym : nil
    end

    def process_doc(h, tags, pos)
      h[:aside] = tags
    end

    def to_html(context)
      context[:aside].map do |aside|
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
          warn("Unknown @aside name: #{type} #{name}", context)
        end
      end.compact
    end

    # special accessor for @aside alone through which assets are set
    attr_accessor :assets

    def get_assets_group(type)
      case type
      when :guide then @assets.guides
      when :video then @assets.videos
      when :example then @assets.examples
      else {}
      end
    end

    def warn(msg, context)
      JsDuck::Logger.warn(:aside, msg, context[:files][0])
      nil
    end

  end
end
