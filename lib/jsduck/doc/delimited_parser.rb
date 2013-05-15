module JsDuck
  module Doc

    # Helper in parsing the default values and type definitions where
    # we take into account correctly nested parenthesis and strings.
    # But at the same time we don't care much about the actual
    # contents.
    class DelimitedParser
      # Initialized with Doc::Scanner instance
      def initialize(doc_scanner)
        @ds = doc_scanner
      end

      # Parses until a closing "}".
      def parse_until_close_curly
        parse_until_close_paren(/\}/, /[^\}]*/)
      end

      # Parses until a closing "]".
      def parse_until_close_square
        parse_until_close_paren(/\]/, /[^\]]*/)
      end

      # Parses until a closing parenthesis or space.
      def parse_until_space
        begin
          parse_while(/[^\[\]\{\}\(\)'"\s]/)
        rescue
          nil
        end
      end

      private

      # Parses until a given closing parenthesis.
      # When unsuccessful, try simple parsing.
      def parse_until_close_paren(re_paren, re_simple)
        begin
          start_pos = @ds.input.pos
          result = parse_while(/[^\[\]\{\}\(\)'"]/)
          if look(re_paren)
            result
          else
            throw "Closing brace expected"
          end
        rescue
          @ds.input.pos = start_pos
          match(re_simple)
        end
      end

      def parse_while(regex)
        result = ""
        while r = parse_compound || match(regex)
          result += r
        end
        result
      end

      def parse_compound
        if look(/\[/)
          parse_balanced(/\[/, /\]/)
        elsif look(/\{/)
          parse_balanced(/\{/, /\}/)
        elsif look(/\(/)
          parse_balanced(/\(/, /\)/)
        elsif look(/"/)
          parse_string('"')
        elsif look(/'/)
          parse_string("'")
        end
      end

      def parse_balanced(re_open, re_close)
        result = match(re_open)

        result += parse_while(/[^\[\]\{\}\(\)'"]/)

        if r = match(re_close)
          result + r
        else
          throw "Unbalanced parenthesis"
        end
      end

      # Parses "..." or '...' including the escape sequence \' or '\"
      def parse_string(quote)
        re_quote = Regexp.new(quote)
        re_rest = Regexp.new("(?:[^"+quote+"\\\\]|\\\\.)*")
        match(re_quote) + match(re_rest) + (match(re_quote) || "")
      end

      ### Forward these calls to Doc::Scanner

      def look(re)
        @ds.look(re)
      end

      def match(re)
        @ds.match(re)
      end
    end

  end
end
