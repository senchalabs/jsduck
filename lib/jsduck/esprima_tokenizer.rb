require 'v8'
require 'json'
require 'singleton'

module JsDuck

  # Uses Esprima.js engine through V8 to tokenize JavaScript string.
  class EsprimaTokenizer
    include Singleton

    def initialize
      @v8 = V8::Context.new
      @v8.load(File.dirname(File.dirname(File.dirname(File.dirname(__FILE__))))+"/esprima/esprima.js")
    end

    # Input must be a String.
    def tokenize(input)
      @v8['js'] = @input = input
      program = JSON.parse(@v8.eval('JSON.stringify(esprima.parse(js, {tokens: true, comment: true}))'), :max_nesting => false)
      doc_comments = program["comments"].find_all {|c| doc_comment?(c) }
      return merge_tokens(program["tokens"], doc_comments).map {|tok| to_jsduck_token(tok) }
    end

    private

    # True if comment is a /** doc-comment */
    def doc_comment?(comment)
      comment["type"] == "Block" && !!(comment["value"] =~ /^\*/)
    end

    # Combines tokens and comments arrays into one array
    # while keeping them in correct order.
    def merge_tokens(tokens, comments)
      result = []
      com = comments.shift
      tok = tokens.shift
      while com || tok
        if !com || tok && (tok["range"][0] < com["range"][0])
          result << tok
          tok = tokens.shift
        else
          result << com
          com = comments.shift
        end
      end
      result
    end

    # Converts Esprima token to JSDuck token
    def to_jsduck_token(tok)
      case tok["type"]
      when "Numeric"
        {:type => :number, :value => tok["value"]}
      when "String"
        {:type => :string, :value => tok["value"]}
      when "Identifier"
        {:type => :ident, :value => tok["value"]}
      when "RegularExpression"
        {:type => :regex, :value => tok["value"]}
      when "Punctuator"
        {:type => :operator, :value => tok["value"]}
      when "Keyword"
        kw = tok["value"].to_sym
        {:type => kw, :value => kw}
      when "Block"
        {
          :type => :doc_comment,
          :value => "/*#{tok['value']}*/",
          :linenr => @input[0...tok["range"][0]].count("\n") + 1,
        }
      else
        throw "Unknown Esprima token type #{tok['type']}"
      end
    end

  end
end
