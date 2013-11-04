require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/io'
require 'jsduck/util/null_object'
require 'jsduck/logger'
require 'jsduck/grouped_asset'
require 'jsduck/guide_toc'
require 'jsduck/guide_anchors'
require 'jsduck/img/dir'
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
        guide["url"] = resolve_url(guide)
        guide[:filename] = guide["url"] + "/README.md"
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
      return Logger.warn(:guide, "Guide not found", guide["url"]) unless File.exists?(guide["url"])
      return Logger.warn(:guide, "Guide not found", guide[:filename]) unless File.exists?(guide[:filename])
      unless js_ident?(guide["name"])
        # Guide name is also used as JSONP callback method name.
        return Logger.warn(:guide, "Guide name is not valid JS identifier: #{guide["name"]}", guide[:filename])
      end

      begin
        return format_guide(guide)
      rescue
        Logger.fatal_backtrace("Error while reading/formatting guide #{guide['url']}", $!)
        exit(1)
      end
    end

    def format_guide(guide)
      @formatter.doc_context = {:filename => guide[:filename], :linenr => 0}
      @formatter.images = Img::Dir.new(guide["url"], "guides/#{guide["name"]}")
      html = @formatter.format(Util::IO.read(guide[:filename]))
      html = GuideToc.inject(html, guide['name'], @opts.guides_toc_level)
      html = GuideAnchors.transform(html, guide['name'])

      # Report unused images (but ignore the icon files)
      @formatter.images.get("icon.png")
      @formatter.images.get("icon-lg.png")
      @formatter.images.report_unused

      return html
    end

    def write_guide(guide, dir)
      return unless guide[:html]

      out_dir = dir + "/" + guide["name"]

      Logger.log("Writing guide", out_dir)
      # Copy the whole guide dir over
      FileUtils.cp_r(guide["url"], out_dir)

      # Ensure the guide has an icon
      fix_icon(out_dir)

      Util::Json.write_jsonp(out_dir+"/README.js", guide["name"], {:guide => guide[:html], :title => guide["title"]})
    end

    # Turns guide URL into full path.
    # If no URL given at all, creates it from guide name.
    def resolve_url(guide)
      if guide["url"]
        File.expand_path(guide["url"], @path)
      else
        @path + "/guides/" + guide["name"]
      end
    end

    # True when string is valid JavaScript identifier
    def js_ident?(str)
      /\A[$\w]+\z/ =~ str
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

    # Returns HTML listing of guides
    def to_html(style="")
      html = @groups.map do |group|
        [
          "<h3>#{group['title']}</h3>",
          "<ul>",
          flatten_subgroups(group["items"]).map {|g| "<li><a href='#!/guide/#{g['name']}'>#{g['title']}</a></li>" },
          "</ul>",
        ]
      end.flatten.join("\n")

      return <<-EOHTML
        <div id='guides-content' style='#{style}'>
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
