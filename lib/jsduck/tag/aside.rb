require "jsduck/tag/tag"
require "jsduck/logger"

module JsDuck::Tag
  class Aside < Tag
    def initialize
      @pattern = "aside"
      @key = :aside
      @html_position = :top
    end

    def parse(p)
      p.add_tag(:aside)
      p.skip_horiz_white
      maybe_aside_type(p)
      p.skip_horiz_white
      p.maybe_name
    end

    def maybe_aside_type(p)
      p.current_tag[:type] = p.ident.to_sym if p.look(/\w+/)
    end

    def process_doc(tags)
      tags
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
      file = context[:files][0]
      JsDuck::Logger.warn(:aside, msg, file[:filename], file[:linenr])
      nil
    end

  end
end
