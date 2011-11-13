require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Writes HTML JavaScript/CSS source into HTML file.
  class SourceWriter

    # Writes all source files as HTML files into destination dir.
    #
    # Can't be done in parallel, because file.html_filename= method
    # updates all the doc-objects related to the file
    def self.write_all(files, destination)
      FileUtils.mkdir(destination)
      src = SourceWriter.new(destination)
      files.each do |file|
        html_filename = src.write(file.to_html, file.filename)
        Logger.instance.log("Writing source", html_filename)
        file.html_filename = File.basename(html_filename)
      end
    end

    # Initializes SourceFormatter to the directory where
    # HTML-formatted source files will be placed.
    def initialize(output_dir)
      @output_dir = output_dir
    end

    # Writes HTML into file in output directory.  It returns the name
    # of the file that it wrote.
    def write(source, filename)
      fname = uniq_html_filename(filename)
      File.open(fname, 'w') do |f|
        f.write(wrap_page(source))
      end
      fname
    end

    def uniq_html_filename(filename)
      fname = html_filename(filename)
      nr = 1
      while file_exists?(fname)
        nr += 1
        fname = html_filename(filename, nr)
      end
      fname
    end

    def html_filename(filename, nr=0)
      @output_dir + "/" + File.basename(filename, ".js") + (nr > 0 ? nr.to_s : "") + ".html"
    end

    # Case-insensitive check for file existance to avoid conflicts
    # when source files dir is moved to Windows machine.
    def file_exists?(filename)
      Dir.glob(filename, File::FNM_CASEFOLD).length > 0
    end

    # Returns source wrapped inside HTML page
    def wrap_page(source)
      return <<-EOHTML
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>The source code</title>
  <link href="../resources/prettify/prettify.css" type="text/css" rel="stylesheet" />
  <script type="text/javascript" src="../resources/prettify/prettify.js"></script>
  <style type="text/css">
    .highlight { display: block; background-color: #ddd; }
  </style>
  <script type="text/javascript">
    function highlight() {
      document.getElementById(location.hash.replace(/#/, "")).className = "highlight";
    }
  </script>
</head>
<body onload="prettyPrint(); highlight();">
  <pre class="prettyprint lang-js">#{source}</pre>
</body>
</html>
      EOHTML
    end

  end

end
