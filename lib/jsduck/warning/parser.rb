require 'strscan'

module JsDuck
  module Warning

    # Parses the warnings passed in from command line
    #
    # Grammar:
    #
    # <warnings>     := <warning> [ "," <warning> ]*
    #
    # <warning>      := ["+" | "-"] <type> [<params-block>] [<path-block>]
    #
    # <type>         := \w+
    #
    # <params-block> := "(" [<params>] ")"
    #
    # <params>       := <param> [ "," <param> ]*
    #
    # <param>        := \w+ | ""
    #
    # <path-block>   := ":" <path>
    #
    # <path>         := .*
    #
    class Parser
      def initialize(string)
        @scanner = StringScanner.new(string)
      end

      # Parses the warnings string.
      #
      # For example the following string:
      #
      #     +tag,-nodoc(class,private):/some/path
      #
      # is parsed into the following structure:
      #
      #     [
      #       {
      #         :type => :tag,
      #         :enabled => true,
      #         :params => [],
      #         :path => nil,
      #       },
      #       {
      #         :type => :nodoc,
      #         :enabled => false,
      #         :params => [:class, :private],
      #         :path => "/some/path",
      #       },
      #     ]
      #
      # When scanning fails, raises an exception with a descriptive
      # message.
      def parse
        results = []

        while !eos?
          results << warning
          match(/,/)
        end

        results
      end

      private

      def warning
        return {
          :enabled => enabled,
          :type => type,
          :params => params,
          :path => path,
        }
      end

      def enabled
        if match(/\+/)
          true
        elsif match(/-/)
          false
        else
          true
        end
      end

      def type
        require(/\w+/).to_sym
      end

      def params
        if match(/\(/)
          ps = []

          while !look(/\)/)
            ps << param
            break unless match(/,/)
          end

          require(/\)/)

          ps
        else
          []
        end
      end

      def param
        if p = match(/\w+/)
          p.to_sym
        elsif look(/,/)
          nil
        else
          unexpected_char
        end
      end

      def path
        if match(/:/)
          match(/[^,]*/).strip
        else
          nil
        end
      end

      # scans a pattern, throws error on failure
      def require(re)
        if m = match(re)
          m
        else
          unexpected_char
        end
      end

      # Reports unexpected character
      def unexpected_char
        # do successful empty scan, so we can use #pre_match and #post_match
        @scanner.scan(//)
        raise "Unexpected '#{@scanner.peek(1)}' at --warnings='#{@scanner.pre_match}<HERE>#{@scanner.post_match}'"
      end

      # scans a pattern, ignoring the optional whitespace before it
      def match(re)
        skip_ws
        @scanner.scan(re)
      end

      def look(re)
        skip_ws
        @scanner.check(re)
      end

      def eos?
        skip_ws
        @scanner.eos?
      end

      def skip_ws
        @scanner.scan(/\s*/)
      end

    end

  end
end
