require "cgi"

module JsDuck

  # Formats JavaScript source into HTML page.  Inside the HTML every
  # source code line will be marked with ID, so that it can be linked
  # from documentation.
  class SourceFormatter

    # Initializes SourceFormatter to the directory where
    # HTML-formatted source files will be placed
    def initialize(output_dir)
      @output_dir = output_dir
    end

    # Converts source to HTML and writes into file in output
    # directory.
    def write(source, filename)
      File.open(html_filename(filename), 'w') {|f| f.write(format(source)) }
    end

    def html_filename(filename)
      @output_dir + "/" + File.basename(filename, ".js") + ".html"
    end

    # Returns full source for HTML page
    def format(source)
      return <<-EOHTML
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>The source code</title>
</head>
<body>
  <pre>#{format_pre(source)}</pre>
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
