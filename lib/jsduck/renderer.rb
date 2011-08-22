module JsDuck

  # Ruby-side implementation of class docs Renderer.
  # Uses PhantomJS to run Docs.Renderer JavaScript.
  class Renderer
    def initialize(opts)
      @opts = opts
      @basedir = @opts.output_dir + "/output-print"
      @tmp_filename = @basedir + "/data.js"
    end

    def write(classData)
      FileUtils.mkdir(@basedir) unless File.exists?(@basedir)
      # Write JSON to a file
      JsonDuck.write_assignment(@tmp_filename, "window.jsonData", classData)
      # Read it in with phantomJS and feed to Docs.Renderer
      html = IO.read("|phantomjs #{@opts.output_dir}/renderer.js #{@opts.output_dir}/print.html")
      # Write resulting HTML
      File.open("#{@basedir}/#{classData[:name]}.html", "w") {|f| f.write(html) }
      # clean up temporary file
      FileUtils.rm(@tmp_filename)
    end
  end

end
