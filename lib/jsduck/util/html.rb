require 'cgi'

module JsDuck
  module Util

    # Helpers for dealing with HTML
    class HTML

      # Strips tags from HTML text
      def self.strip_tags(html)
        html.gsub(/<.*?>/, "")
      end

      # Escapes HTML, replacing < with &lt; ...
      def self.escape(html)
        CGI.escapeHTML(html)
      end

      # Unescapes HTML, replacing &lt; with < ...
      def self.unescape(html)
        CGI.unescapeHTML(html)
      end

    end

  end
end
