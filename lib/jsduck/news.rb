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
      @new_items = filter_new_items(relations)
    end

    # Returns the HTML
    def to_html(style="")
      return [
        "<div id='news-content' style='#{style}'>",
          "<div class='section'>",
            "<h1>New in this version</h1>",
            render_columns(@new_items),
            "<div style='clear:both'></div>",
          "</div>",
        "</div>",
      ].flatten.join("\n")
    end

    private

    def filter_new_items(relations)
      classes = []
      new_items = []

      relations.each do |cls|
        if !cls[:meta][:private]
          if cls[:meta][:new]
            classes << cls
          else
            members = filter_new_members(cls)
            if members.length > 0
              new_items << {:name => cls[:name], :members => members}
            end
          end
        end
      end

      new_items.sort! {|a, b| a[:name] <=> b[:name] }

      # Place the new classes section at the beginning
      if classes.length > 0
        new_items.unshift({:name => "New classes", :members => classes})
      end

      new_items
    end

    def filter_new_members(cls)
      members = []
      cls.all_local_members.each do |m|
        members << m if m[:meta][:new] && visible?(m)
      end
      members = discard_accessors(members)
      members.sort! {|a, b| a[:name] <=> b[:name] }
    end

    def visible?(member)
      !member[:meta][:private] && !member[:meta][:hide]
    end

    def discard_accessors(members)
      accessors = {}
      members.find_all {|m| m[:accessor] }.each do |cfg|
        accessors["set" + upcase_first(cfg[:name])] = true
        accessors["get" + upcase_first(cfg[:name])] = true
        accessors[cfg[:name].downcase + "change"] = true if cfg[:evented]
      end

      members.reject {|m| accessors[m[:name]] }
    end

    def upcase_first(str)
      str[0,1].upcase + str[1..-1]
    end

    def render_columns(new_items)
      align = ["left-column", "middle-column", "right-column"]
      i = -1
      return @columns.split(new_items, 3).map do |col|
        i += 1
        [
          "<div class='#{align[i]}'>",
          render_col(col),
          "</div>",
        ]
      end
    end

    def render_col(col)
      return col.map do |item|
        [
          "<h3>#{item[:name]}</h3>",
          "<ul class='links'>",
          item[:members].map {|m| "<li>" + link(m) + "</li>" },
          "</ul>",
        ]
      end
    end

    def link(m)
      if m[:tagname] == :class
        @doc_formatter.link(m[:name], nil, m[:name])
      else
        @doc_formatter.link(m[:owner], m[:name], m[:name], m[:tagname], m[:meta][:static])
      end
    end

  end

end
