require 'jsduck/logger'
require 'jsduck/json_duck'
require 'jsduck/null_object'
require 'fileutils'

module JsDuck

  # Reads in guides and converts them to JsonP files
  class Guides
    # Creates Guides object from filename and formatter
    def self.create(filename, formatter)
      if filename
        Guides.new(filename, formatter)
      else
        NullObject.new(:to_array => [], :to_html => "")
      end
    end

    # Parses guides config file
    def initialize(filename, formatter)
      @path = File.dirname(filename)
      @guides = JsonDuck.read(filename)
      @formatter = formatter
    end

    # Writes all guides to given dir in JsonP format
    def write(dir)
      FileUtils.mkdir(dir) unless File.exists?(dir)
      get_all_items().each{ |g| write_guide(g, dir) }
      # Write the JSON to output dir, so it's available in released
      # version of docs and people can use it with JSDuck by themselves.
      JsonDuck.write_json(dir+"/guides.json", @guides)
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
      @guides.each do |topic| 
        all_topics.push(topic)
      	get_subitems(topic, all_topics)
      end
      return all_topics
    end

    def write_guide(guide, dir)
      guide_dir = @path + "/guides/" + guide["name"]
      tutorial_dir = @path + "/tutorials/" + guide["name"]
      out_dir = dir + "/" + guide["name"]

      if File.exists?(guide_dir)
        in_dir = guide_dir
      elsif File.exists?(tutorial_dir)
        in_dir = tutorial_dir
      else
        return Logger.instance.warn(:guide, "Guide #{guide_dir} / #{tutorial_dir} not found")
      end

      guide_file = in_dir + "/README.html"
      return Logger.instance.warn(:guide, "README.html not found in #{in_dir}") unless File.exists?(guide_file)
      Logger.instance.log("Writing guide", out_dir)
      # Copy the whole guide dir over
      FileUtils.cp_r(in_dir, out_dir)
      name = File.basename(in_dir)
      html = IO.read(guide_file)

      
#      guide_file = in_dir + "/README.md"
#      return Logger.instance.warn(:guide, "README.md not found in #{in_dir}") unless File.exists?(guide_file)
#      Logger.instance.log("Writing guide", out_dir)
#      # Copy the whole guide dir over
#      FileUtils.cp_r(in_dir, out_dir)
#      @formatter.doc_context = {:filename => guide_file, :linenr => 0}
#      name = File.basename(in_dir)
#      @formatter.img_path = "guides/#{name}"
#      html = add_toc(guide, @formatter.format(IO.read(guide_file)))

      JsonDuck.write_jsonp(out_dir+"/README.js", name, {:guide => html, :title => guide["title"]})
    end

#    # Creates table of contents at the top of guide by looking for <h2> elements in HTML.
#    def add_toc(guide, html)
#      toc = [
#        "<p><strong>Contents</strong></p>\n",
#        "<ul class='toc'>\n",
#      ]
#      new_html = []
#      i = 0
#      html.each_line do |line|
#        if line =~ /^<h2>(.*)<\/h2>$/
#          i += 1
#          toc << "<li><a href='#!/guide/#{guide['name']}-section-#{i}'>#{$1}</a></li>\n"
#          new_html << "<h2 id='#{guide['name']}-section-#{i}'>#{$1}</h2>\n"
#        else
#          new_html << line
#        end
#      end
#      toc << "</ul>\n"
#      # Inject TOC at below first heading
#      new_html.insert(1, toc)
#      new_html.flatten.join
#    end

    # Returns all guides as array
    def to_array
      @guides
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
    def to_html
      html = @guides.map { |topic| topic2html(topic, 1)}.flatten.join("\n")

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
  end

end
