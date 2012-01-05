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

    def merge_tokens(tokens, comments)
      comments.each {|c| tokens.insert(index_of(c["range"], tokens), c) }
      tokens
    end

    # returns the index where the token with given range should be inserted.
    def index_of(range, tokens)
      if tokens.length == 0 || tokens.last["range"][1] < range[0]
        return tokens.length
      end

      left = 0
      right = tokens.length - 1

      while left < right
        middle = (left + right) / 2

        if right - left == 1 && tokens[left]["range"][1] < range[0] && range[1] < tokens[right]["range"][0]
          break
        elsif range[1] < tokens[middle]["range"][0]
          right = middle
        else
          left = middle + 1
        end
      end

      right
    end

  end
end
