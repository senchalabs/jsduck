require 'jsduck/util/null_object'

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

      @classes = []
      relations.each do |cls|
        if !cls[:meta][:private]
          group = {:name => cls[:name], :members => []}
          cls.all_local_members.each do |m|
            group[:members] << m if m[:meta][:new] && !m[:meta][:private] && !m[:meta][:hide]
          end
          @classes << group if group[:members].length > 0
        end
      end
    end

    # Returns the HTML
    def to_html(style="")
      html = @classes.map {|c| render_class(c) }.flatten.join("\n")

      return <<-EOHTML
      <div id='news-content' style='#{style}'>
        <h1>New in this version</h1>
        <div class='section'>
          <h1>Members</h1>
          #{html}
        </div>
      </div>
      EOHTML
    end

    def render_class(cls)
      [
        "<h3>#{cls[:name]}</h3>",
        "<ul class='links'>",
        cls[:members].map {|m| "<li>" + link(m) + "</li>" },
        "</ul>",
      ]
    end

    def link(m)
      @doc_formatter.link(m[:owner], m[:name], m[:name], m[:tagname], m[:meta][:static])
    end

  end

end
