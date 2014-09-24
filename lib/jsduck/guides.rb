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
      build_map_by_name("Two guides have the same name: " +  filename)
      load_all_guides
    end

    # Writes all guides to given dir in JsonP format
    def write(dir)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      each_item { |g| write_guide(g, dir) }
      # Write the JSON to output dir, so it's available in released
      # version of docs and people can use it with JSDuck by themselves.
      #JsonDuck.write_json(dir+"/guides.json", @groups)
    end

    def get_subitems(group, all_topics)
      if !group['items'].nil? && !group['items'].empty?
        group['items'].each do |item| 
          all_topics.push(item)
          get_subitems(item, all_topics)
        end
      end
    end

    def get_all_items
      all_topics = []
      @groups.each do |topic| 
        all_topics.push(topic)
      	get_subitems(topic, all_topics)
      end
      return all_topics
    end

    # Overrides GroupedAsset to handle nested guides
    # for Ti, names must be globally unique. 
    #
    # Should be called from constructor after @groups have been read in,
    # and after it's been ensured that all items in groupes have names.
    # 
    # Prints warning when there is a duplicate item within a group.
    # The warning message should say something like "duplicate <asset type>"
    def build_map_by_name(warning_msg)
      @map_by_name = {}
      get_all_items().each do |item|
        if @map_by_name[item["name"]]
          Logger.instance.warn(:dup_asset, "#{warning_msg} '#{item['name']}'")
        end
        @map_by_name[item["name"]] = item
      end
    end

    # Modified each_item that also loads HTML for each guide
    def each_item
      get_all_items().each  do |guide|
        # Load the guide if not loaded
        guide["url"] = resolve_url(guide)
        guide[:html] = load_guide(guide) if guide[:html] == nil
        # Pass guide to block if it was successfully loaded.
        yield guide if guide[:html]
      end
    end

    def load_all_guides
      each_item do |guide|
        guide["url"] = resolve_url(guide)
        guide[:filename] = guide["url"] + "/README.md"
        guide[:html] = load_guide(guide)
      end
    end


    # Overrides GroupedAsset
    # Modified to_array that excludes the :html from guide nodes
    def to_array
      get_all_items().map do |group|
        {
          "title" => group["title"],
          "items" => group["items"].map {|g| Hash[g.select {|k, v| k != :html }] }
        }
      end
    end

    def load_guide(guide)
      return Logger.warn(:guide, "Guide not found", guide["url"]) unless File.exists?(guide["url"])
      unless js_ident?(guide["name"])
        # Guide name is also used as JSONP callback method name.
        Logger.warn(:guide, "Guide name is not valid JS identifier: #{guide["name"]}")
      end
      html_guide_file = guide["url"] + "/README.html"
      guide_file = guide["url"] + "/README.md"

      if File.exists?(html_guide_file)
        begin
          # Ti guides already have a TOC, so don't add one.
          return Util::IO.read(html_guide_file)
        rescue
          Logger.fatal_backtrace("Error while reading/formatting HTML guide #{guide["url"]}", $!)
          exit(1)
        end
      elsif File.exists?(guide_file)
        begin
          return format_guide(guide, guide_file)
        rescue
          Logger.fatal_backtrace("Error while reading/formatting guide #{guide["url"]}", $!)
          exit(1)
        end
      else
        return Logger.warn(:guide, "No README.html or README.md in #{guide["url"]}")
      end    
    end

    def format_guide(guide, guide_file)
      @formatter.doc_context = {:filename => guide_file, :linenr => 0}
      @formatter.images = Img::Dir.new(guide["url"], "guides/#{guide["name"]}")
      html = @formatter.format(Util::IO.read(guide_file))
      html = GuideToc.inject(html, guide['name'], @opts.guide_toc_level)
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

    # Returns all guides as array
    def to_array
      @groups
    end

    def topic2html(group, deepness)
      res = []
      res.push("<li><h${deepness}><a href='#!/guide/#{group['name']}'>#{group['title']}</a></h#{deepness}>")
      if !group["items"].nil? && !group["items"].empty?
	      res.push("<ul>")
    	  group["items"].map do |g|
      		res.push(topic2html(g, deepness + 1))
	      end
    	  res.push("</ul>")
      end
      res.push("</li>")
      return res.flatten.join("\n")
    end

    # Returns HTML listing of guides
    def to_html(style="")
      html = @groups.map { |topic| topic2html(topic, 1)}.flatten.join("\n") 

#      html = @guides.map do |group|
#        [
#          "<h3>#{group['title']}</h3>",
#          "<ul>",
#          group["items"].map {|g| "<li><a href='#!/guide/#{g['name']}'>#{g['title']}</a></li>" },
#          "</ul>",
#        ]
#      end.flatten.join("\n")

      return <<-EOHTML
        <div id='guides-content' style='display:none'>
        	<ul>
	            #{html}
            </ul>
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
      guide["name"] + "/icon.png"
    end

  end

end
