require 'jsduck/js/parser'
require 'jsduck/js/ast'
require 'jsduck/css/parser'
require 'jsduck/doc_parser'
require 'jsduck/merger'
require 'jsduck/doc_type'
require 'jsduck/doc_map'
require 'jsduck/doc_ast'
require 'jsduck/class_doc_expander'

module JsDuck
  module Source

    # Performs the actual parsing of CSS or JS source.
    #
    # This is the class that brings together all the different steps of
    # parsing the source.
    class FileParser

      def initialize
        @doc_parser = DocParser.new
        @class_doc_expander = ClassDocExpander.new
        @doc_ast = DocAst.new
        @merger = Merger.new
      end

      # Parses file into final docset that can be fed into Aggregator
      def parse(contents, filename="", options={})
        @doc_ast.filename = filename

        parse_js_or_css(contents, filename, options).map do |docset|
          expand(docset)
        end.flatten.map do |docset|
          merge(docset)
        end
      end

      private

      # Parses the file depending on filename as JS or CSS
      def parse_js_or_css(contents, filename, options)
        if filename =~ /\.s?css$/
          docs = Css::Parser.new(contents, options).parse
        else
          docs = Js::Parser.new(contents, options).parse
          docs = Js::Ast.new(docs).detect_all!
        end
      end

      # Parses the docs, detects tagname and expands class docset
      def expand(docset)
        docset[:comment] = @doc_parser.parse(docset[:comment], @doc_ast.filename, docset[:linenr])
        docset[:doc_map] = DocMap.build(docset[:comment])
        docset[:tagname] = DocType.detect(docset[:doc_map], docset[:code])

        if docset[:tagname] == :class
          # expand class into several docsets, and rebuild doc-maps for all of them.
          @class_doc_expander.expand(docset).map do |ds|
            ds[:doc_map] = DocMap.build(ds[:comment])
            ds
          end
        else
          docset
        end
      end

      # Merges comment and code parts of docset
      def merge(docset)
        @doc_ast.linenr = docset[:linenr]
        docset[:comment] = @doc_ast.detect(docset[:tagname], docset[:comment], docset[:doc_map])
        docset.delete(:doc_map)

        @merger.merge(docset)
      end
    end

  end
end
