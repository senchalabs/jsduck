require 'jsduck/js_parser'
require 'jsduck/css_parser'
require 'jsduck/merger'
require "cgi"

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

    def initialize(contents, filename="", options={})
      @contents = contents
      @filename = filename
      @options = options
      @html_filename = ""
      @links = {}

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
      @links.each_value do |line|
        line.each do |doc|
          doc[:html_filename] = @html_filename
          doc[:href] = @html_filename + "#" + id(doc)
        end
      end
    end

    # Returns source code as HTML with lines starting doc-comments specially marked.
    def to_html
      linenr = 0
      lines = []
      # Use #each_line instead of #lines to support Ruby 1.6
      @contents.each_line do |line|
        linenr += 1;
        line = CGI.escapeHTML(line)
        # wrap the line in as many spans as there are links to this line number.
        if @links[linenr]
          @links[linenr].each do |doc|
            line = "<span id='#{id(doc)}'>#{line}</span>"
          end
        end
        lines << line
      end
      lines.join()
    end

    def id(doc)
      if doc[:tagname] == :class
        doc[:name].gsub(/\./, '-')
      else
        # when creation of global class is skipped,
        # this owner property can be nil.
        (doc[:owner] || "global").gsub(/\./, '-') + "-" + doc[:id]
      end
    end

    private

    # Parses the file depending on filename as JS or CSS
    def parse
      if @filename =~ /\.s?css$/
        CssParser.new(@contents, @options).parse
      else
        JsParser.new(@contents, @options).parse
      end
    end

    # Creates two-way link between sourcefile and doc-object.
    # If doc-object is class, links also the contained cfgs and constructor.
    # Returns the modified doc-object after done.
    def link(linenr, doc)
      @links[linenr] = [] unless @links[linenr]
      @links[linenr] << doc
      doc[:filename] = @filename
      doc[:linenr] = linenr
      if doc[:tagname] == :class
        doc[:members][:cfg].each {|cfg| link(linenr, cfg) }
        doc[:members][:method].each {|method| link(linenr, method) }
      end
      doc
    end

  end

end
