require "cgi"

module JsDuck

  # Formats JavaScript source into HTML page.  Inside the HTML every
  # source code line will be marked with ID, so that it can be linked
  # from documentation.
  class SourceFormatter

    # Initializes SourceFormatter to the directory where
    # HTML-formatted source files will be placed.
    #
    # formatter can be either :format_page or :format_pre; with the
    # first one the whole HTML page is created, otherwise just a
    # contents of <pre> element.
    def initialize(output_dir, formatter = :format_page)
      @output_dir = output_dir
      @formatter = formatter
    end

    # Converts source to HTML and writes into file in output
    # directory.  It returns the name of the file that it wrote.
    def write(source, filename)
      fname = uniq_html_filename(filename)
      File.open(fname, 'w') {|f| f.write(self.send(@formatter, source)) }
      fname
    end

    def uniq_html_filename(filename)
      fname = html_filename(filename)
      nr = 1
      while File.exists?(fname)
        nr += 1
        fname = html_filename(filename, nr)
      end
      fname
    end

    def html_filename(filename, nr=0)
      @output_dir + "/" + File.basename(filename, ".js") + (nr > 0 ? nr.to_s : "") + ".html"
    end

    # Returns full source for HTML page
    def format_page(source)
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
  <pre class="prettyprint lang-js">#{format_pre(source)}</pre>
</body>
</html>
      EOHTML
    end

    # Formats the contents of <pre>, wrapping each source code line
    # inside <span>.
    def format_pre(source)
      i = 0
      return source.lines.collect do |line|
        i += 1
        "<span id='line-#{i}'>#{CGI.escapeHTML(line)}</span>"
      end.join()
    end

  end

end
