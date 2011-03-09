module JsDuck

  # Rewrites doc-comment contents from already parsed doc-object.
  class DocWriter
    # Creates doc-comment of particular type
    def write(type, doc)
      to_comment(self.send(type, doc).flatten.compact.join("\n"), doc[:orig_comment])
    end

    # Surrounds comment within /** ... */
    # Indents it the same amount as original comment we're replacing.
    # Also trims trailing whitespace and double empty lines.
    def to_comment(raw_lines, orig_comment)
      # measure the indentation of original comment
      indent = orig_comment.match(/^.*?\n( *) /)[1]
      # construct the /**-surrounded-comment
      comment = []
      comment << "/**"
      prev_line = ""
      raw_lines.each_line do |line|
        line.rstrip!
        # Don't put more than one empty line in a row
        unless line == "" && prev_line == ""
          comment << (indent + " * " + line).rstrip
        end
        prev_line = line
      end
      comment << indent + " */"
      comment.join("\n")
    end

    # The following methods produce the actual comment contents.  They
    # return either array, string, or nil.  Nils are removed, arrays
    # flattened, and each string is converted to a line.

    def class(cls)
      return [
        "@class " + cls[:name],
        cls[:extends] ? "@extends " + cls[:extends] : nil,
        cls[:singleton] ? "@singleton" : nil,
        cls[:xtype] ? "@xtype " + cls[:xtype] : nil,
        cls[:private] ? "@private" : nil,
        "",
        cls[:markdown] ? cls[:doc] : html2text(cls[:doc]),
        constructor(cls),
      ]
    end

    def method(m)
      return [
        method_rest(m),
      ]
    end

    def event(e)
      return [
        "@event",
        method_rest(e),
      ]
    end

    def constructor(cls)
      con = cls[:method].find {|m| m[:name] == "constructor" }
      return nil if !con

      return [
        "",
        "@constructor",
        method_rest(con),
      ]
    end

    # the part shared by both normal method and constructor
    def method_rest(m)
      return [
        html2text(m[:doc]),
        m[:params].map {|p| param(p) },
        retrn(m[:return]),
        m[:private] ? "@private" : nil,
      ]
    end

    def param(p)
      return [
        "@param",
        type(p[:type], "Object"),
        p[:name],
        p[:doc] != "" ? html2text(p[:doc]) : nil,
      ].compact.join(" ")
    end

    def retrn(r)
      return nil if !r || r[:type] == "void" && r[:doc] == ""

      return [
        "@return",
        type(r[:type], "void"),
        r[:doc] != "" ? html2text(r[:doc]) : nil,
      ].compact.join(" ")
    end

    def type(t, default)
      t && t != default ? "{"+t+"}" : nil
    end

    # Does HTML to Markdown magic using python script.
    def html2text(html)
      File.open("temp.html", 'w') {|f| f.write(html) }
      `python html2text.py temp.html > temp.text`
      text = IO.read("temp.text")
      FileUtils.rm("temp.html")
      FileUtils.rm("temp.text")
      return text.strip
    end
  end

end
