require 'strscan'

module JsDuck

  # Tokenizes JavaScript code into lexical tokens.
  #
  # Each token has a type and value.
  # Types and possible values for them are as follows:
  #
  # - :number      -- 25
  # - :string      -- "Hello world"
  # - :ident       -- "foo"
  # - :regex       -- "/abc/i"
  # - :operator    -- "+"
  # - :doc_comment -- "/** My comment */"
  #
  # Plus a separate types for all keywords: :if, :while, :function, ...
  # For keywords the type and value are the same.
  #
  # Notice that doc-comments are recognized as tokens while normal
  # comments are ignored just as whitespace.
  #
  class Lexer
    # Input can be either a String or StringScanner.
    #
    # In the latter case we ensure that only #next will advance the
    # scanpointer of StringScanner - this allows context-switching
    # while parsing some string.  Specifically we need this feature to
    # parse some JavaScript inside doc-comments.
    def initialize(input)
      @input = input.is_a?(StringScanner) ? input : StringScanner.new(input)
      @buffer = []
    end

    # Tests if given pattern matches the tokens that follow at current
    # position.
    #
    # Takes list of strings and symbols.  Symbols are compared to
    # token type, while strings to token value.  For example:
    #
    #     look(:ident, "=", :regex)
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
    #
    # For efficency we look for tokens in order of frequency in
    # JavaScript source code:
    #
    # - first check for most common operators.
    # - then for identifiers and keywords.
    # - then strings
    # - then comments
    #
    # The remaining token types are less frequent, so these are left
    # to the end.
    #
    def next_token
      while !@input.eos? do
        skip_white
        if @input.check(/[.(),;={}:]/)
          return {
            :type => :operator,
            :value => @input.scan(/./)
          }
        elsif @input.check(/[a-zA-Z_$]/)
          value = @input.scan(/[$\w]+/)
          kw = KEYWORDS[value]
          return {
            :type => kw || :ident,
            :value => kw || value
          }
        elsif @input.check(/'/)
          return {
            :type => :string,
            :value => @input.scan(/'([^'\\]|\\.)*('|\Z)/m).gsub(/\A'|'\Z/m, "")
          }
        elsif @input.check(/"/)
          return {
            :type => :string,
            :value => @input.scan(/"([^"\\]|\\.)*("|\Z)/m).gsub(/\A"|"\Z/m, "")
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
          elsif regex?
            return {
              :type => :regex,
              :value => @input.scan(META_REGEX)
            }
          else
            return {
              :type => :operator,
              :value => @input.scan(/\//)
            }
          end
        elsif @input.check(/[0-9]+/)
          nr = @input.scan(/[0-9]+(\.[0-9]*)?/)
          return {
            :type => :number,
            :value => nr
          }
        elsif  @input.check(/./)
          return {
            :type => :operator,
            :value => @input.scan(/./)
          }
        end
      end
    end

    # A slash "/" is a division operator if it follows:
    # - identifier
    # - the "this" keyword
    # - number
    # - closing bracket )
    # - closing square-bracket ]
    # Otherwise it's a beginning of regex
    def regex?
      if @previous_token
        type = @previous_token[:type]
        value = @previous_token[:value]
        if type == :ident || type == :number
          return false
        elsif type == :this
          return false
        elsif type == :operator && (value == ")" || value == "]")
          return false
        end
      end
      return true
    end

    def skip_white
      @input.scan(/\s+/)
    end

    # A regex to match a regex
    META_REGEX = %r{
      /               (?# beginning    )
      (
        [^/\[\\]      (?# any character except \ / [    )
        |
        \\.           (?# an escaping \ followed by any character    )
        |
        \[ ([^\]\\]|\\.)* \]    (?# [...] containing any characters including /    )
                                (?# except \ ] which have to be escaped    )
      )*
      (/[gim]*|\Z)   (?# ending + modifiers    )
    }x

    KEYWORDS = {
      "break" => :break,
      "case" => :case,
      "catch" => :catch,
      "continue" => :continue,
      "default" => :default,
      "delete" => :delete,
      "do" => :do,
      "else" => :else,
      "finally" => :finally,
      "for" => :for,
      "function" => :function,
      "if" => :if,
      "in" => :in,
      "instanceof" => :instanceof,
      "new" => :new,
      "return" => :return,
      "switch" => :switch,
      "this" => :this,
      "throw" => :throw,
      "try" => :try,
      "typeof" => :typeof,
      "var" => :var,
      "void" => :void,
      "while" => :while,
      "with" => :with,
    }
  end

end
