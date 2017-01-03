require 'jsduck/util/html'
require 'jsduck/logger'
require 'pp'

module JsDuck
  module Inline

    # Implementation of inline tag {@img}
    class Img
      # Instance of Img::Dir or Img::DirSet that's used for looking up
      # image information.
      attr_accessor :images

      # Sets up instance to work in context of particular doc object.
      # Used for error reporting.
      attr_accessor :doc_context

      def initialize(opts={})
        @tpl = opts[:img_tpl] || '<img src="%u" alt="%a" width="%w" height="%h"/>'

        @re = /\{@img\s+(\S*?)(?:\s+(.+?))?\}/m
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
        img = @images.get(url)
        if !img
          Logger.warn(:image, "Image #{url} not found.", @doc_context[:filename], @doc_context[:linenr])
          img = {}
        end

        @tpl.gsub(/(%\w)/) do
          case $1
          when '%u'
            img[:relative_path]
          when '%a'
            Util::HTML.escape(alt_text||"")
          when '%w'
            img[:width]
          when '%h'
            img[:height]
          else
            $1
          end
        end
      end
    end

  end
end
