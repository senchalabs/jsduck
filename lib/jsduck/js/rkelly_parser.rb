require 'jsduck/js/rkelly_adapter'
require 'rkelly'

module JsDuck
  module Js

    # An alternative JsDuck::Js::Parser implementation that uses
    # RKelly instead of Esprima.  We also take advantage of RKelly
    # already including comments inside AST nodes.
    class RKellyParser < RKellyAdapter
      RKELLY = RKelly::Parser.new

      def initialize(input, options={})
        @input = input
        @docsets = []
      end

      # Parses JavaScript source code and returns array of hashes like this:
      #
      #     {
      #         :comment => "The contents of the comment",
      #         :code => {...AST data structure for code following the comment...},
      #         :linenr => 12,  // Beginning with 1
      #         :type => :doc_comment, // or :plain_comment
      #     }
      #
      def parse
        ast = RKELLY.parse(@input)
        adapt(ast)
        @docsets
      end

      # An extra layer on top of RKellyAdapter#adapt method, which
      # checks for comments in each node encountered.
      #
      # When comment is encountered, a docset node is created and the
      # adapted AST is associated with it.
      #
      # Otherwise we just pass through to RKellyAdapter#adapt.
      def adapt(node)
        if !node.comments.empty?
          split_comments(node.comments).each do |comment|
            @docsets << comment
          end
          last_docset = @docsets.last
          last_docset[:code] = super(node)
        else
          super(node)
        end
      end

      private

      def split_comments(raw_comments)
        comments = []
        prev_line_comment_nr = nil
        raw_comments.each do |c|
          if c.value =~ /\A\/\// && prev_line_comment_nr == c.line - 1
            comments.last[:comment] += "\n" + c.value
          else
            comments << {
              :comment => c.value,
              :linenr => c.line,
              :type => c.value =~ /\A\/\*\*/ ? :doc_comment : :plain_comment,
            }
          end
          prev_line_comment_nr = c.value =~ /\A\/\// ? c.line : nil
        end
        comments
      end
    end

  end
end
