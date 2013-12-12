require 'jsduck/meta_tag_registry'

module JsDuck

  # Performs the rendering of meta tags.
  class MetaTagRenderer

    # Renders full meta tags of a particular section.
    #
    # Returns array of rendered HTML or nil if no meta data.
    def self.render(meta_data, position)
      return if meta_data.size == 0

      MetaTagRegistry.instance.tags(position).map do |tag|
        meta_data[tag.key]
      end
    end

    # Renders the meta-tag signatures for a class member.
    # Returns a string.
    def self.render_signature(member)
      html = []
      MetaTagRegistry.instance.signatures.each do |s|
        if member[:meta][s[:key]]
          title = s[:tooltip] ? "title='#{s[:tooltip]}'" : ""
          html << "<strong class='#{s[:key]} signature' #{title}>#{s[:long]}</strong>"
        end
      end
      html.join
    end

  end

end
