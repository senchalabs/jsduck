require 'jsduck/js/parser'
require 'jsduck/js/ast'
require 'jsduck/css/parser'
require 'jsduck/doc/parser'
require 'jsduck/doc/processor'
require 'jsduck/doc/map'
require 'jsduck/merger'
require 'jsduck/base_type'
require 'jsduck/class_doc_expander'

module JsDuck
  # Performs the actual parsing of SCSS or JS source.
  #
  # This is the class that brings together all the different steps of
  # parsing the source.
  class Parser

    def initialize
      @doc_parser = Doc::Parser.new
      @class_doc_expander = ClassDocExpander.new
      @doc_processor = Doc::Processor.new
      @merger = Merger.new
      @filename = ""
    end

    # Parses file into final docset that can be fed into Aggregator
    def parse(contents, filename="", options={})
      @doc_processor.filename = @filename = filename

      parse_js_or_scss(contents, filename, options).map do |docset|
        expand(docset)
      end.flatten.map do |docset|
        merge(docset)
      end
    end

    private

    # Parses the file depending on filename as JS or SCSS
    def parse_js_or_scss(contents, filename, options)
      if filename =~ /\.scss$/
        docs = Css::Parser.new(contents, options).parse
      else
        docs = Js::Parser.new(contents, options).parse
        docs = Js::Ast.new(docs).detect_all!
      end
    end

    # Parses the docs, detects tagname and expands class docset
    def expand(docset)
      docset[:comment] = @doc_parser.parse(docset[:comment], @filename, docset[:linenr])
      docset[:doc_map] = Doc::Map.build(docset[:comment])
      docset[:tagname] = BaseType.detect(docset[:doc_map], docset[:code])

      if docset[:tagname] == :class
        # expand class into several docsets, and rebuild doc-maps for all of them.
        @class_doc_expander.expand(docset).map do |ds|
          ds[:doc_map] = Doc::Map.build(ds[:comment])
          ds
        end
      else
        docset
      end
    end

    # Merges comment and code parts of docset
    def merge(docset)
      @doc_processor.linenr = docset[:linenr]
      docset[:comment] = @doc_processor.process(docset[:tagname], docset[:doc_map])
      docset.delete(:doc_map)

      @merger.merge(docset, @filename, docset[:linenr])
    end
  end

end
