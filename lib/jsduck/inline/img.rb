require 'jsduck/util/html'
require 'jsduck/logger'

module JsDuck
  module Inline

    # Implementation of inline tag {@img}
    class Img
      # Base path to prefix images from {@img} tags.
      # Defaults to no prefix.
      attr_accessor :base_path

      # This will hold list of all image paths gathered from {@img} tags.
      attr_accessor :images

      def initialize(opts={})
        @tpl = opts[:img_tpl] || '<img src="%u" alt="%a"/>'

        @re = /\{@img\s+(\S*?)(?:\s+(.+?))?\}/m

        @base_path = nil
        @images = []
      end

      # Takes StringScanner instance.
      #
      # Looks for inline tag at the current scan pointer position, when
      # found, moves scan pointer forward and performs the apporpriate
      # replacement.
      def replace(input)
        if input.check(@re)
          input.scan(@re).sub(@re) { apply_tpl($1, $2) }
        else
          false
        end
      end

      # applies the image template
      def apply_tpl(url, alt_text)
        @images << url
        @tpl.gsub(/(%\w)/) do
          case $1
          when '%u'
            @base_path ? (@base_path + "/" + url) : url
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
