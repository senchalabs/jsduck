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
      @new_members = []
      relations.each do |cls|
        if !cls[:meta][:private]
          cls.all_local_members.each do |m|
            @new_members << m if m[:meta][:new] && !m[:meta][:private] && !m[:meta][:hide]
          end
        end
      end
    end

    # Returns the HTML
    def to_html(style="")
      html = "<ul>" + @new_members.map {|m| "<li>#{link(m)}</li>" }.join + "</ul>"

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

    def link(m)
      @doc_formatter.link(m[:owner], m[:name], "#{m[:owner]}.#{m[:name]}", m[:tagname], m[:meta][:static])
    end

  end

end
