require 'v8'
require 'json'

module JsDuck

  # New experimental lexer that uses Esprima.js through V8.
  class EsprimaLexer
    def initialize
      @v8 = V8::Context.new
      @v8.load(File.dirname(File.dirname(File.dirname(File.dirname(__FILE__))))+"/esprima/esprima.js")
    end

    # Input must be a String.
    def tokenize(input)
      @v8['js'] = input
      program = JSON.parse(@v8.eval('JSON.stringify(esprima.parse(js, {tokens: true, comment: true}))'), :max_nesting => false)
      merge_tokens(program["tokens"], program["comments"].find_all {|c| doc_comment?(c) })
    end

    # True if comments is a /** doc-comment */
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

  end
end
