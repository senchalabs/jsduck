require 'singleton'
require 'jsduck/esprima_parser'
require 'jsduck/css_parser'
require 'jsduck/doc_parser'
require 'jsduck/merger'
require 'jsduck/ast'
require 'jsduck/doc_type'
require 'jsduck/class_doc_expander'

module JsDuck

  # Performs the actual parsing of CSS or JS source.
  #
  # This is the class that brings together all the different steps of
  # parsing the source.
  class SourceFileParser
    include Singleton

    def initialize
      @doc_type = DocType.new
      @doc_parser = DocParser.new
      @class_doc_expander = ClassDocExpander.new
      @merger = Merger.new
    end

    # Parses file into final docset that can be fed into Aggregator
    def parse(contents, filename="", options={})
      @merger.filename = filename

      parse_js_or_css(contents, filename, options)
        .map {|docset| expand(docset) }
        .flatten
        .map {|docset| merge(docset) }
    end

    private

    # Parses the file depending on filename as JS or CSS
    def parse_js_or_css(contents, filename, options)
      if filename =~ /\.s?css$/
        docs = CssParser.new(contents, options).parse
      else
        docs = EsprimaParser.new(contents, options).parse
        docs = Ast.new(docs).detect_all!
      end
    end

    # Parses the docs, detects tagname and expands class docset
    def expand(docset)
      docset[:comment] = @doc_parser.parse(docset[:comment])
      docset[:tagname] = @doc_type.detect(docset[:comment], docset[:code])

      if docset[:tagname] == :class
        @class_doc_expander.expand(docset)
      else
        docset
      end
    end

    # Merges comment and code parst of docset
    def merge(docset)
      @merger.linenr = docset[:linenr]
      @merger.merge(docset)
    end
  end

end
