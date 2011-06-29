require 'jsduck/logger'
require 'json'

module JsDuck

  # Reads in categories and outputs JSON file
  class Categories
    def initialize(doc_formatter, relations={})
      @doc_formatter = doc_formatter
      @relations = relations
      @categories = []
    end

    # Parses categories in JSON file
    def parse(path)
      @categories = JSON.parse(IO.read(path))["categories"]
    end

    # Prints warnings for missing classes in categories file
    def validate
      listed_classes = {}

      # Check that each class listed in overview file exists
      @categories.each do |cat|
        cat["groups"].each do |group|
          group["classes"].each do |cls_name|
            unless @relations[cls_name]
              Logger.instance.warn("Class '#{cls_name}' in category '#{cat['name']}/#{group['name']}' not found")
            end
            listed_classes[cls_name] = true
          end
        end
      end

      # Check that each existing non-private class is listed in overview file
      @relations.each do |cls|
        unless listed_classes[cls[:name]] || cls[:private]
          Logger.instance.warn("Class '#{cls[:name]}' not found in categories file")
        end
      end
    end

    # Returns HTML listing of classes divided into categories
    def to_html
      html = @categories.map do |category|
        [
          "<div class='section classes'>",
          "<h1>#{category['name']}</h1>",
          render_columns(category['groups']),
          "<div style='clear:both'></div>",
          "</div>",
        ]
      end.flatten.join("\n")

      return <<-EOHTML
        <div id='categories-content' style='display:none'>
            #{html}
        </div>
      EOHTML
    end

    def render_columns(groups)
      align = ["lft", "mid", "rgt"]
      i = -1
      return split_to_columns(groups, 3).map do |col|
        i += 1
        [
          "<div class='#{align[i]}'>",
          render_groups(col),
          "</div>",
        ]
      end
    end

    def render_groups(groups)
      return groups.map do |g|
        [
          "<h3>#{g['name']}</h3>",
          "<div class='links'>",
          g["classes"].map {|cls| @relations[cls] ? @doc_formatter.link(cls, nil, cls) : cls },
          "</div>",
        ]
      end
    end

    def split_to_columns(groups, n)
      header_size = 3
      # The size of one item is it's number of classes + the space for header
      total_size = groups.reduce(0) {|sum, g| sum + g["classes"].length + header_size }

      # split into n columns
      avg_col_size = (total_size / n).ceil
      columns = Array.new(n) {|i| [] }

      col_size = 0
      col_index = 0
      groups.each do |g|
        col_size += g["classes"].length + header_size
        columns[col_index] << g
        if col_size >= avg_col_size
          col_index += 1
          col_size = 0
        end
      end

      columns
    end

  end

end
