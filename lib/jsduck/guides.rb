require 'jsduck/jsonp'
require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Reads in guides and converts them to JsonP files
  class Guides
    def initialize(formatter, order=nil)
      @guides = []
      @formatter = formatter
      @order = order
    end

    # Looks for guide in each subdir of given directory.
    def parse_dir(guides_dir)
      Dir.glob(guides_dir + "/*").each do |dir|
        if File.directory?(dir)
          parse_guide(dir)
        end
      end

      if @order
        # When order specified, place guides into that order and
        # exclude those guides that aren't listed in @order
        @guides = @order.map {|name| @guides.find {|g| g[:name] =~ Regexp.new("^"+Regexp.escape(name)) } }
      else
        # Otherwise sort guides alphabetically
        @guides.sort! {|a, b| a[:title] <=> b[:title] }
      end
    end

    def parse_guide(dir)
      guide_file = dir + "/README.md"
      unless File.exists?(guide_file)
        return Logger.instance.warn("README.md not found in #{dir}")
      end

      Logger.instance.log("Parsing guide #{guide_file} ...")
      markdown = IO.read(guide_file)
      name = File.basename(dir)
      # Treat the first line of file as title
      title = markdown.match(/^#\s*([^\n]*?)(\r?\n|$)/)[1]

      @formatter.doc_context = {:filename => guide_file, :linenr => 0}
      html = @formatter.format(markdown)
      html.gsub!(/<img src="/, "<img src=\"guides/#{name}/")

      @guides << {
        :dir => dir,
        :name => name,
        :title => title,
        :icon => File.exists?(dir+"/icon.png"),
        :html => html,
      }
    end

    # Writes all guides to given dir in JsonP format
    def write(dir)
      # Skip it all when we have no guides
      FileUtils.mkdir(dir) if @guides.length > 0

      @guides.each do |guide|
        out_dir = dir+"/"+guide[:name]
        FileUtils.cp_r(guide[:dir], out_dir)
        # Write the JsonP file
        JsonP.write(out_dir+"/README.js", guide[:name], {:guide => guide[:html]})
      end
    end

    # Returns HTML listing of guides
    def to_html
      return "" if @guides.length == 0

      links = @guides.map do |g|
        style = g[:icon] ? "style='background: url(guides/#{g[:name]}/icon.png) no-repeat'" : ""
        "<a class='guide' rel='#{g[:name]}' #{style} href='#/guide/#{g[:name]}'>#{g[:title]}</a>"
      end

      # Divide to three columns: lft, mid, rgt
      col_height = (links.length / 3.0).ceil
      return <<-EOHTML
        <div id='guides-content' style='display:none'>
            <div class="lft">
                #{links.slice(0, col_height).join("\n")}
            </div>
            <div class="mid">
                #{links.slice(col_height, col_height).join("\n")}
            </div>
            <div class="rgt">
                #{links.slice(col_height*2, col_height).join("\n")}
            </div>
        </div>
      EOHTML
    end

    # Creates tree-structure containing all guides
    def to_tree
      return {} if @guides.length == 0

      return {
        :text => 'Guides',
        :children => @guides.map do |g|
          {
            :text => g[:title],
            :url => "/guide/"+g[:name],
            :iconCls => "icon-guide",
            :leaf => true
          }
        end
      }
    end

    # Iterates over each guide
    def each(&block)
      @guides.each &block
    end

    # Returns number of guides
    def length
      @guides.length
    end

  end

end
