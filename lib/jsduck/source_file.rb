require 'jsduck/js_parser'
require 'jsduck/css_parser'
require 'jsduck/merger'

module JsDuck

  # Represents one JavaScript or CSS source file.
  #
  # The filename parameter determines whether it's parsed as
  # JavaScript (the default) or CSS.
  class SourceFile
    attr_reader :filename
    attr_reader :contents
    attr_reader :docs
    attr_reader :html_filename

    def initialize(contents, filename="")
      @contents = contents
      @filename = filename
      @html_filename = ""
      @links = []

      merger = Merger.new
      @docs = parse.map do |docset|
        link(docset[:linenr], merger.merge(docset[:comment], docset[:code]))
      end
    end

    # loops through each doc-object in file
    def each(&block)
      @docs.each(&block)
    end

    # Sets the html filename of this file,
    # updating also all doc-objects linking this file
    def html_filename=(html_filename)
      @html_filename = html_filename
      @links.each do |doc|
        doc[:html_filename] = @html_filename
        doc[:href] = @html_filename + "#line-" + doc[:linenr].to_s
      end
    end

    private

    # Parses the file depending on filename as JS or CSS
    def parse
      if @filename =~ /\.s?css$/
        CssParser.new(@contents).parse
      else
        JsParser.new(@contents).parse
      end
    end

    # Creates two-way link between sourcefile and doc-object.
    # If doc-object is class, links also the contained cfgs and constructor.
    # Returns the modified doc-object after done.
    def link(linenr, doc)
      @links << doc
      doc[:filename] = @filename
      doc[:linenr] = linenr
      if doc[:tagname] == :class
        doc[:cfg].each {|cfg| link(linenr, cfg) }
        doc[:method].each {|method| link(linenr, method) }
      end
      doc
    end

  end

end
