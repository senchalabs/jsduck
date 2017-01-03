require 'strscan'

module JsDuck

  # Tokenizes CSS or SCSS code into lexical tokens.
  #
  # Each token has a type and value.
  # Types and possible values for them are as follows:
  #
  # - :number      -- "25.8"
  # - :percentage  -- "25%"
  # - :dimension   -- "2em"
  # - :string      -- '"Hello world"'
  # - :ident       -- "foo-bar"
  # - :at_keyword  -- "@mixin"
  # - :hash        -- "#00FF66"
  # - :delim       -- "{"
  # - :doc_comment -- "/** My comment */"
  #
  # Notice that doc-comments are recognized as tokens while normal
  # comments are ignored just as whitespace.
  #
  class CssLexer
    # Initializes lexer with input string.
    def initialize(input)
      @input = StringScanner.new(input)
      @buffer = []
    end

    # Tests if given pattern matches the tokens that follow at current
    # position.
    #
    # Takes list of strings and symbols.  Symbols are compared to
    # token type, while strings to token value.  For example:
    #
    #     look(:ident, ":", :dimension)
    #
    def look(*tokens)
      buffer_tokens(tokens.length)
      i = 0
      tokens.all? do |t|
        tok = @buffer[i]
        i += 1
        if !tok
          false
        elsif t.instance_of?(Symbol)
          tok[:type] == t
        else
          tok[:value] == t
        end
      end
    end

    # Returns the value of next token, moving the current token cursor
    # also to next token.
    #
    # When full=true, returns full token as hash like so:
    #
    #     {:type => :ident, :value => "foo"}
    #
    # For doc-comments the full token also contains the field :linenr,
    # pointing to the line where the doc-comment began.
    #
    def next(full=false)
      buffer_tokens(1)
      tok = @buffer.shift
      # advance the scanpointer to the position after this token
      @input.pos = tok[:pos]
      full ? tok : tok[:value]
    end

    # True when no more tokens.
    def empty?
      buffer_tokens(1)
      return !@buffer.first
    end

    # Ensures next n tokens are read in buffer
    #
    # At the end of buffering the initial position scanpointer is
    # restored.  Only the #next method will advance the scanpointer in
    # a way that's visible outside this class.
    def buffer_tokens(n)
      prev_pos = @input.pos
      @input.pos = @buffer.last[:pos] if @buffer.last
      (n - @buffer.length).times do
        @previous_token = tok = next_token
        if tok
          # remember scanpointer position after each token
          tok[:pos] = @input.pos
          @buffer << tok
        end
      end
      @input.pos = prev_pos
    end

    # Parses out next token from input stream.
    def next_token
      while !@input.eos? do
        skip_white
        if @input.check(IDENT)
          return {
            :type => :ident,
            :value => @input.scan(IDENT)
          }
        elsif @input.check(/'/)
          return {
            :type => :string,
            :value => @input.scan(/'([^'\\]|\\.)*('|\Z)/m)
          }
        elsif @input.check(/"/)
          return {
            :type => :string,
            :value => @input.scan(/"([^"\\]|\\.)*("|\Z)/m)
          }
        elsif @input.check(/\//)
          # Several things begin with dash:
          # - comments, regexes, division-operators
          if @input.check(/\/\*\*[^\/]/)
            return {
              :type => :doc_comment,
              # Calculate current line number, starting with 1
              :linenr => @input.string[0...@input.pos].count("\n") + 1,
              :value => @input.scan_until(/\*\/|\Z/).sub(/\A\/\*\*/, "").sub(/\*\/\Z/, "")
            }
          elsif @input.check(/\/\*/)
            # skip multiline comment
            @input.scan_until(/\*\/|\Z/)
          elsif @input.check(/\/\//)
            # skip line comment
            @input.scan_until(/\n|\Z/)
          else
            return {
              :type => :operator,
              :value => @input.scan(/\//)
            }
          end
        elsif @input.check(NUM)
          nr = @input.scan(NUM)
          if @input.check(/%/)
            return {
              :type => :percentage,
              :value => nr + @input.scan(/%/)
            }
          elsif @input.check(IDENT)
            return {
              :type => :dimension,
              :value => nr + @input.scan(IDENT)
            }
          else
            return {
              :type => :number,
              :value => nr
            }
          end
        elsif @input.check(/@/)
          return maybe(:at_keyword, /@/, IDENT)
        elsif @input.check(/#/)
          return maybe(:hash, /#/, NAME)
        elsif @input.check(/\$/)
          return maybe(:var, /\$/, IDENT)
        elsif @input.check(/./)
          return {
            :type => :delim,
            :value => @input.scan(/./)
          }
        end
      end
    end

    # Returns token of given type when both regexes match.
    # Otherwise returns :delim token with value of first regex match.
    # First regex must always match.
    def maybe(token_type, before_re, after_re)
      before = @input.scan(before_re)
      if @input.check(after_re)
        return {
          :type => token_type,
          :value => before + @input.scan(after_re)
        }
      else
        return {
          :type => :delim,
          :value => before
        }
      end
    end

    def skip_white
      @input.scan(/\s+/)
    end

    # Simplified token syntax based on:
    # http://www.w3.org/TR/CSS21/syndata.html
    IDENT = /-?[_a-z][_a-z0-9-]*/i
    NAME = /[_a-z0-9-]+/i
    NUM = /[0-9]*\.[0-9]+|[0-9]+/

  end

end
