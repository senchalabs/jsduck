# -*- coding: utf-8 -*-
require 'jsduck/util/html'
require 'jsduck/util/singleton'

module JsDuck

  # Little helper for shortening text
  class Shortener
    include Util::Singleton

    # Maximum length for text that doesn't get shortened.
    # The accessor is used for testing purposes only.
    attr_accessor :max_length

    def initialize
      @max_length = 120
    end

    # Shortens text
    #
    # 116 chars is also where ext-doc makes its cut, but unlike
    # ext-doc we only make the cut when there's more than 120 chars.
    #
    # This way we don't get stupid expansions like:
    #
    #   Blah blah blah some text...
    #
    # expanding to:
    #
    #   Blah blah blah some text.
    #
    def shorten(input)
      sent = first_sentence(Util::HTML.strip_tags(input).strip)
      # Use u-modifier to correctly count multi-byte characters
      chars = sent.scan(/./mu)
      if chars.length > @max_length
        chars[0..(@max_length-4)].join + "..."
      else
        sent + " ..."
      end
    end

    # Returns the first sentence inside a string.
    def first_sentence(str)
      str.sub(/\A(.+?(\.|。))\s.*\Z/mu, "\\1")
    end

    # Returns true when input should get shortened.
    def too_long?(input)
      stripped = Util::HTML.strip_tags(input).strip
      # for sentence v/s full - compare byte length
      # for full v/s max - compare char length
      first_sentence(stripped).length < stripped.length || stripped.scan(/./mu).length > @max_length
    end

  end

end
