require 'cgi'

module JsDuck

  # Transforms in-page links so they won't break docs app #!-navigation.
  #
  # For example a link to "#automation" in testing guide will be
  # replaced with "#!/guide/testing-section-automation" and the link
  # target ID will be transformed into "testing-section-automation".
  class GuideAnchors

    def self.transform(html, guide_name)
      html.gsub(/(<a\s+(?:[^<>]*\s+)?href=['"]#)([^!\/].*?)(['"])/i) do |m|
        $1 + "!/guide/" + transform_id($2, guide_name) + $3

      end.gsub(/(<a\s+(?:[^<>]*\s+)?name=['"])(.*?)(['"])/i) do |m|
        $1 + transform_id($2, guide_name) + $3

      end.gsub(/(<\w+\s+(?:[^<>]*\s+)?id=['"])(.*?)(['"])/i) do |m|
        $1 + transform_id($2, guide_name) + $3
      end
    end

    def self.transform_id(id, guide_name)
      if id =~ /^#{guide_name}-section-/
        id
      else
        # Escape the ID if it's not already escaped.  This check is
        # needed to avoid re-escaping anchor-links created with
        # Markdown - these get auto-escaped by RDiscount.
        id = (id =~ /%[0-9A-F]{2}/) ? id : CGI::escape(id)

        "#{guide_name}-section-#{id}"
      end
    end

  end

end
