require 'jsduck/jsonp'
require 'jsduck/logger'
require 'fileutils'
require 'json'

module JsDuck

  # Reads in guides and converts them to JsonP files
  class Guides
    def initialize(formatter)
      @formatter = formatter
      @guides = []
    end

    # Parses guides config file
    def parse(filename)
      @path = File.dirname(filename)
      @guides = JSON.parse(IO.read(filename))
    end

    # Writes all guides to given dir in JsonP format
    def write(dir)
      return if @guides.length == 0

      FileUtils.mkdir(dir) unless File.exists?(dir)
      @guides.each {|group| group["items"].each {|g| write_guide(g, dir) } }
      # Write the JSON to output dir, so it's available in released
      # version of docs and people can use it with JSDuck by themselves.
      File.open(dir+"/guides.json", 'w') {|f| f.write(JSON.generate(@guides)) }
    end

    def write_guide(guide, dir)
      in_dir = @path + "/" + guide["name"]
      out_dir = dir + "/" + guide["name"]
      return Logger.instance.warn("Guide #{in_dir} not found") unless File.exists?(in_dir)
      guide_file = in_dir + "/README.md"
      return Logger.instance.warn("README.md not found in #{in_dir}") unless File.exists?(guide_file)

      Logger.instance.log("Writing guide #{out_dir} ...")
      # Copy the whole guide dir over
      FileUtils.cp_r(in_dir, out_dir)

      @formatter.doc_context = {:filename => guide_file, :linenr => 0}
      html = @formatter.format(IO.read(guide_file))
      name = File.basename(in_dir)
      html.gsub!(/<img src="/, "<img src=\"guides/#{name}/")

      JsonP.write(out_dir+"/README.js", name, {:guide => html})
    end

    # Returns all guides as array
    def to_array
      @guides
    end

  end

end
