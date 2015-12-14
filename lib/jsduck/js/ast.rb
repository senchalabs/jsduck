require "jsduck/js/class"
require "jsduck/js/method"
require "jsduck/js/event"
require "jsduck/js/property"
require "jsduck/js/node"

module JsDuck
  module Js

    # Analyzes the AST produced by EsprimaParser.
    class Ast
      # Should be initialized with EsprimaParser#parse result.
      def initialize(docs = [])
        @docs = docs
      end

      # Performs the detection of code in all docsets.
      #
      # @returns the processed array of docsets. (But it does it
      # destructively by modifying the passed-in docsets.)
      #
      def detect_all!
        # First deal only with doc-comments
        doc_comments = @docs.find_all {|d| d[:type] == :doc_comment }

        # Detect code in each docset.  Sometimes a docset has already
        # been detected as part of detecting some previous docset (like
        # Class detecting all of its configs) - in such case, skip.
        doc_comments.each do |docset|
          code = docset[:code]
          docset[:code] = detect(code) unless code && code[:tagname]
        end

        # Return all doc-comments + other comments for which related
        # code was detected.
        @docs.find_all {|d| d[:type] == :doc_comment || d[:code] && d[:code][:tagname] }
      end

      # Given Esprima-produced syntax tree, detects documentation data.
      #
      # This method is exposed for testing purposes only, JSDuck itself
      # only calls the above #detect_all method.
      #
      # @param ast :code from Result of EsprimaParser
      # @returns Hash consisting of the detected :tagname, :name, and
      # other properties relative to the tag.  Like so:
      #
      #     { :tagname => :method, :name => "foo", ... }
      #
      def detect(node)
        ast = Js::Node.create(node)

        if doc = Js::Class.detect(ast, @docs)
          doc
        elsif doc = Js::Method.detect(ast)
          doc
        elsif doc = Js::Event.detect(ast)
          doc
        elsif doc = Js::Property.detect(ast)
          doc
        else
          Js::Property.make()
        end
      end

    end

  end
end
