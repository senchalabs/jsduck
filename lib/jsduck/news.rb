require 'jsduck/util/null_object'
require 'jsduck/columns'

module JsDuck

  class News
    # Creates News object from relations data when --import option
    # specified.
    def self.create(relations, doc_formatter, opts)
      if opts[:imports].length > 0
        News.new(relations, doc_formatter)
      else
        Util::NullObject.new(:to_html => "")
      end
    end

    # Generates list of new classes & members in this version.
    def initialize(relations, doc_formatter)
      @doc_formatter = doc_formatter
      @columns = Columns.new(:members)

      @classes = []
      relations.each do |cls|
        if !cls[:meta][:private]
          group = {:name => cls[:name], :members => [], :new => cls[:meta][:new]}
          cls.all_local_members.each do |m|
            group[:members] << m if m[:meta][:new] && !m[:meta][:private] && !m[:meta][:hide]
          end
          @classes << group if group[:members].length > 0
        end
      end
    end

    # Returns the HTML
    def to_html(style="")
      return [
        "<div id='news-content' style='#{style}'>",
          "<div class='section'>",
            "<h1>New in this version</h1>",
            render_columns(@classes),
            "<div style='clear:both'></div>",
          "</div>",
        "</div>",
      ].flatten.join("\n")
    end

    private

    def render_columns(classes)
      align = ["left-column", "middle-column", "right-column"]
      i = -1
      return @columns.split(classes, 3).map do |col|
        i += 1
        [
          "<div class='#{align[i]}'>",
          render_classes(col),
          "</div>",
        ]
      end
    end

    def render_classes(classes)
      return classes.map do |cls|
        [
          "<h3>#{link_class(cls)}</h3>",
          "<ul class='links'>",
          cls[:members].map {|m| "<li>" + link_member(m) + "</li>" },
          "</ul>",
        ]
      end
    end

    def link_class(cls)
      if cls[:new]
        @doc_formatter.link(cls[:name], nil, cls[:name])
      else
        cls[:name]
      end
    end

    def link_member(m)
      @doc_formatter.link(m[:owner], m[:name], m[:name], m[:tagname], m[:meta][:static])
    end

  end

end
