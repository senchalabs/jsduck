require 'jsduck/logger'
require 'json'

module JsDuck

  # Reads in categories and outputs JSON file
  class Categories
    def initialize(doc_formatter)
      @doc_formatter = doc_formatter
      @overview = {"organisation" => [], "categories" => {}}
    end

    # Parses categories in JSON file
    def parse(path)
      @overview = JSON.parse(IO.read(path))
    end

    # Prints warnings for missing classes in categories file
    def validate(relations)
      overview_classes = {}

      # Check that each class listed in overview file exists
      @overview["categories"].each_pair do |cat_name, cat|
        cat["classes"].each do |cls_name|
          unless relations[cls_name]
            Logger.instance.warn("Class '#{cls_name}' in category '#{cat_name}' not found")
          end
          overview_classes[cls_name] = true
        end
      end

      # Check that each existing non-private class is listed in overview file
      relations.each do |cls|
        unless overview_classes[cls[:name]] || cls[:private]
          Logger.instance.warn("Class '#{cls[:name]}' not found in overview file")
        end
      end
    end

    # Returns HTML listing of classes divided into categories
    def to_html
      html = @overview["organisation"].map do |group|
        [
          "<div class='section classes'>",
          "<h1>#{group['name']}</h1>",
          group['categories'].map do |cat|
            [
              "<div class='#{cat['align']}'>",
              cat['items'].map do |item|
                [
                  "<h3>#{item}</h3>",
                  "<div class='links'>",
                  class_links(item),
                  "</div>",
                ]
              end,
              "</div>",
            ]
          end,
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

    def class_links(category)
      return @overview["categories"][category]["classes"].map do |cls|
        @doc_formatter.link(cls, nil, cls)
      end
    end

  end

end
