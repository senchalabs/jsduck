require 'jsduck/tag_registry'

module JsDuck

  # Performs the rendering of tags.
  class TagRenderer
    # Renders tags of a particular section.
    #
    # Takes member or class hash.
    # Returns array of rendered HTML.
    def self.render(member)
      TagRegistry.html_renderers.map do |tag|
        if member[tag.key]
          tag.to_html(member)
        else
          nil
        end
      end
    end

    # Renders the signatures for a class member.
    # Returns a string.
    def self.render_signature(member)
      html = []
      TagRegistry.signatures.each do |s|
        if member[s[:key]]
          title = s[:tooltip] ? "title='#{s[:tooltip]}'" : ""
          html << "<strong class='#{s[:key]} signature' #{title}>#{s[:long]}</strong>"
        end
      end
      html.join
    end

  end

end
