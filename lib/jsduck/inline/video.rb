require 'jsduck/util/html'
require 'jsduck/logger'

module JsDuck
  module Inline

    # Implementation of inline tag {@video}
    class Video
      # Sets up instance to work in context of particular doc object.
      # Used for error reporting.
      attr_accessor :doc_context

      def initialize(opts={})
        @doc_context = {}

        @templates = {
          "html5" => '<video src="%u">%a</video>',
          "vimeo" => [
            '<p><iframe src="http://player.vimeo.com/video/%u" width="640" height="360" frameborder="0" ',
                'webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></p>'
          ].join
        }

        @re = /\{@video\s+(\w+)\s+(\S*?)(?:\s+(.+?))?\}/m
      end

      # Takes StringScanner instance.
      #
      # Looks for inline tag at the current scan pointer position, when
      # found, moves scan pointer forward and performs the apporpriate
      # replacement.
      def replace(input)
        if input.check(@re)
          input.scan(@re).sub(@re) { apply_tpl($1, $2, $3) }
        else
          false
        end
      end

      # applies the video template of the specified type
      def apply_tpl(type, url, alt_text)
        unless @templates.has_key?(type)
          ctx = @doc_context
          Logger.warn(nil, "Unknown video type #{type}", ctx[:filename], ctx[:linenr])
        end

        @templates[type].gsub(/(%\w)/) do
          case $1
          when '%u'
            url
          when '%a'
            Util::HTML.escape(alt_text||"")
          else
            $1
          end
        end
      end
    end

  end
end
