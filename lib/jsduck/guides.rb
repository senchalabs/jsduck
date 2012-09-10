require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/io'
require 'jsduck/util/null_object'
require 'jsduck/logger'
require 'jsduck/grouped_asset'
require 'jsduck/util/html'
require 'fileutils'

module JsDuck

  # Reads in guides and converts them to JsonP files
  class Guides < GroupedAsset
    # Creates Guides object from filename and formatter
    def self.create(filename, formatter, opts)
      if filename
        Guides.new(filename, formatter, opts)
      else
        Util::NullObject.new(:to_array => [], :to_html => "", :[] => nil)
      end
    end

    # Parses guides config file
    def initialize(filename, formatter, opts)
      @path = File.dirname(filename)
      @groups = Util::Json.read(filename)
      @formatter = formatter
      @opts = opts
      build_map_by_name
      load_all_guides
    end

    # Writes all guides to given dir in JsonP format
    def write(dir)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      each_item {|guide| write_guide(guide, dir) }
    end

    def load_all_guides
      each_item do |guide|
        guide[:html] = load_guide(guide)
      end
    end

    # Modified to_array that excludes the :html from guide nodes
    def to_array
      map_items do |item|
        Hash[item.select {|k, v| k != :html }]
      end
    end

    def load_guide(guide)
      in_dir = @path + "/guides/" + guide["name"]

      return Logger.instance.warn(:guide, "Guide not found", in_dir) unless File.exists?(in_dir)

      guide_file = in_dir + "/README.md"

      return Logger.instance.warn(:guide, "Guide not found", guide_file) unless File.exists?(guide_file)

      begin
        @formatter.doc_context = {:filename => guide_file, :linenr => 0}
        name = File.basename(in_dir)
        @formatter.img_path = "guides/#{name}"

        return add_toc(guide, @formatter.format(Util::IO.read(guide_file)))
      rescue
        Logger.instance.fatal_backtrace("Error while reading/formatting guide #{in_dir}", $!)
        exit(1)
      end
    end

    def write_guide(guide, dir)
      return unless guide[:html]

      in_dir = @path + "/guides/" + guide["name"]
      out_dir = dir + "/" + guide["name"]

      Logger.instance.log("Writing guide", out_dir)
      # Copy the whole guide dir over
      FileUtils.cp_r(in_dir, out_dir)

      # Ensure the guide has an icon
      fix_icon(out_dir)

      Util::Json.write_jsonp(out_dir+"/README.js", guide["name"], {:guide => guide[:html], :title => guide["title"]})
    end

    # Ensures the guide dir contains icon.png.
    # When there isn't looks for icon-lg.png and renames it to icon.png.
    # When neither exists, copies over default icon.
    def fix_icon(dir)
      if File.exists?(dir+"/icon.png")
        # All ok
      elsif File.exists?(dir+"/icon-lg.png")
        FileUtils.mv(dir+"/icon-lg.png", dir+"/icon.png")
      else
        FileUtils.cp(@opts.template_dir+"/resources/images/default-guide.png", dir+"/icon.png")
      end
    end

    # Creates table of contents at the top of guide by looking for <h2> elements in HTML.
    def add_toc(guide, html)
      toc = [
        "<div class='toc'>\n",
        "<p><strong>Contents</strong></p>\n",
        "<ol>\n",
      ]
      new_html = []
      i = 0
      html.each_line do |line|
        if line =~ /^<h2>(.*)<\/h2>$/
          i += 1
          text = Util::HTML.strip_tags($1)
          toc << "<li><a href='#!/guide/#{guide['name']}-section-#{i}'>#{text}</a></li>\n"
          new_html << "<h2 id='#{guide['name']}-section-#{i}'>#{text}</h2>\n"
        else
          new_html << line
        end
      end
      toc << "</ol>\n"
      toc << "</div>\n"
      # Inject TOC at below first heading if at least 2 items in TOC
      if i >= 2
        new_html.insert(1, toc)
        new_html.flatten.join
      else
        html
      end
    end

    # Returns HTML listing of guides
    def to_html
      html = @groups.map do |group|
        [
          "<h3>#{group['title']}</h3>",
          "<ul>",
          flatten_subgroups(group["items"]).map {|g| "<li><a href='#!/guide/#{g['name']}'>#{g['title']}</a></li>" },
          "</ul>",
        ]
      end.flatten.join("\n")

      return <<-EOHTML
        <div id='guides-content' style='display:none'>
            #{html}
        </div>
      EOHTML
    end

    def flatten_subgroups(items)
      result = []
      each_item(items) do |item|
        result << item
      end
      result
    end

    # Extracts guide icon URL from guide hash
    def icon_url(guide)
      "guides/" + guide["name"] + "/icon.png"
    end

  end

end
