require 'jsduck/logger'
require 'jsduck/file_categories'
require 'jsduck/auto_categories'
require 'jsduck/categories_class_name'

module JsDuck

  # Reads in categories and outputs them as HTML div
  class Categories
    def self.create(filename, doc_formatter, relations)
      if filename
        categories = FileCategories.new(filename, relations)
      else
        categories = AutoCategories.new(relations)
      end
      Categories.new(categories.generate, doc_formatter, relations)
    end

    def initialize(categories, doc_formatter, relations={})
      @categories = categories
      @class_name = CategoriesClassName.new(doc_formatter, relations)
    end

    # Returns HTML listing of classes divided into categories
    def to_html(style="")
      html = @categories.map do |category|
        [
          "<div class='section'>",
          "<h1>#{category['name']}</h1>",
          render_columns(category['groups']),
          "<div style='clear:both'></div>",
          "</div>",
        ]
      end.flatten.join("\n")

      return <<-EOHTML
        <div id='categories-content' style='#{style}'>
            #{html}
        </div>
      EOHTML
    end

    def render_columns(groups)
      align = ["left-column", "middle-column", "right-column"]
      i = -1
      return split(groups, 3).map do |col|
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
          "<ul class='links'>",
          g["classes"].map {|cls| "<li>" + @class_name.render(cls) + "</li>" },
          "</ul>",
        ]
      end
    end

    # Splits the array of items into n chunks so that the sum of
    # largest chunk is as small as possible.
    #
    # This is a brute-force implementation - we just try all the
    # combinations and choose the best one.
    def split(items, n)
      if n == 1
        [items]
      elsif items.length <= n
        Array.new(n) {|i| items[i] ? [items[i]] : [] }
      else
        min_max = nil
        min_arr = nil
        i = 0
        while i <= items.length-n
          i += 1
          # Try placing 1, 2, 3, ... items to first chunk.
          # Calculate the remaining chunks recursively.
          cols = [items[0,i]] + split(items[i, items.length], n-1)
          max = max_sum(cols)
          # Is this the optimal solution so far? Remember it.
          if !min_max || max < min_max
            min_max = max
            min_arr = cols
          end
        end
        min_arr
      end
    end

    def max_sum(cols)
      cols.map {|col| sum(col) }.max
    end

    # Finds the total size of items in array
    #
    # The size of one item is it's number of classes + the space for header
    def sum(arr)
      header_size = 3
      arr.reduce(0) {|sum, item| sum + item["classes"].length + header_size }
    end

  end

end
