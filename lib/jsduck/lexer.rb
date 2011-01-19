require 'strscan'

module JsDuck

  # Tokenizes JavaScript code into lexical tokens.
  #
  # Each token has a type and value.
  # Types and possible values for them are as follows:
  #
  # - :number      -- 25
  # - :string      -- "Hello world"
  # - :keyword     -- "typeof"
  # - :ident       -- "foo"
  # - :regex       -- "/abc/i"
  # - :operator    -- "+"
  # - :doc_comment -- "/** My comment */"
  #
  # Notice that doc-comments are recognized as tokens while normal
  # comments are ignored just as whitespace.
  #
  class Lexer
    def initialize(input)
      @input = StringScanner.new(input)
      tokenize
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
      i = 0
      tokens.all? do |t|
        tok = @tokens[i]
        i += 1
        return false if tok == nil
        if t.instance_of?(Symbol)
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
      tok = @tokens.shift
      full ? tok : tok[:value]
    end

    # True when no more tokens.
    def empty?
      @tokens.empty?
    end

    # Goes through the whole input and tokenizes it
    def tokenize
      @tokens = []
      while !@input.eos? do
        skip_white
        if @input.check(/[0-9]+/)
          nr = @input.scan(/[0-9]+(\.[0-9]*)?/)
          @tokens << {
            :type => :number,
            # When number ends with ".", append "0" so Ruby eval will work
            :value => eval(/\.$/ =~ nr ? nr+"0" : nr)
          }
        elsif @input.check(/\w+/)
          value = @input.scan(/\w+/)
          @tokens << {
            :type => KEYWORDS[value] ? :keyword : :ident,
            :value => value
          }
        elsif @input.check(/\$/)
          value = @input.scan(/\$\w*/)
          @tokens << {
            :type => :ident,
            :value => value
          }
        elsif @input.check(/"/)
          @tokens << {
            :type => :string,
            :value => eval(@input.scan(/"([^"\\]|\\.)*"/))
          }
        elsif @input.check(/'/)
          @tokens << {
            :type => :string,
            :value => eval(@input.scan(/'([^'\\]|\\.)*'/))
          }
        elsif @input.check(/\//)
          # Several things begin with dash:
          # - comments, regexes, division-operators
          if @input.check(/\/\*\*/)
            @tokens << {
              :type => :doc_comment,
              # Calculate current line number, starting with 1
              :linenr => @input.string[0...@input.pos].count("\n") + 1,
              :value => @input.scan_until(/\*\/|\Z/)
            }
          elsif @input.check(/\/\*/)
            # skip multiline comment
            @input.scan_until(/\*\/|\Z/)
          elsif @input.check(/\/\//)
            # skip line comment
            @input.scan_until(/\n|\Z/)
          elsif regex?
            @tokens << {
              :type => :regex,
              :value => @input.scan(/\/([^\/\\]|\\.)*\/[gim]*/)
            }
          else
            @tokens << {
              :type => :operator,
              :value => @input.scan(/\//)
            }
          end
        elsif @input.check(/./)
          @tokens << {
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
      if @tokens.last
        type = @tokens.last[:type]
        value = @tokens.last[:value]
        if type == :ident || type == :number
          return false
        elsif type == :keyword && value == "this"
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

    KEYWORDS = {
      "break" => true,
      "case" => true,
      "catch" => true,
      "continue" => true,
      "default" => true,
      "delete" => true,
      "do" => true,
      "else" => true,
      "finally" => true,
      "for" => true,
      "function" => true,
      "if" => true,
      "in" => true,
      "instanceof" => true,
      "new" => true,
      "return" => true,
      "switch" => true,
      "this" => true,
      "throw" => true,
      "try" => true,
      "typeof" => true,
      "var" => true,
      "void" => true,
      "while" => true,
      "with" => true,
    }
  end

end
