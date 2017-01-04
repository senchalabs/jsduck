require 'jsduck/logger'
require 'jsduck/util/parallel'
require 'fileutils'

module JsDuck
  module Source

    # Writes HTML JavaScript/CSS source into HTML files.
    class Writer
      def initialize(source_files)
        @source_files = source_files
      end

      # Writes all source files as HTML files into destination dir.
      def write(destination)
        generate_html_filenames

        FileUtils.mkdir(destination)
        Util::Parallel.each(@source_files) do |file|
          Logger.log("Writing source", file.html_filename)
          write_single(destination + "/" + file.html_filename, file.to_html)
        end
      end

      private

      # Generates unique HTML filenames for each file.
      #
      # Can't be done in parallel for obvious reasons, but also
      # because file.html_filename= method updates all the doc-objects
      # related to the file.
      def generate_html_filenames
        filenames = {}
        @source_files.each do |file|
          i = 0
          begin
            name = html_filename(file.filename, i)
            ci_name = name.downcase # case insensitive name
            i += 1
          end while filenames.has_key?(ci_name)
          filenames[ci_name] = true
          file.html_filename = name
        end
      end

      # Returns HTML filename for n'th file with given name.
      #
      # html_filename("Foo.js", 0) => "Foo.html"
      # html_filename("Foo.js", 1) => "Foo2.html"
      # html_filename("Foo.js", 2) => "Foo3.html"
      #
      def html_filename(filename, nr=0)
        ::File.basename(filename, ".js") + (nr > 0 ? (nr+1).to_s : "") + ".html"
      end

      def write_single(filename, source)
        ::File.open(filename, 'w') {|f| f.write(wrap_page(source)) }
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
end
