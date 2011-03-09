module JsDuck

  # Rewrites doc-comment contents from already parsed doc-object.
  class DocWriter
    def class(cls)
      return [
        "@class " + cls[:name],
        cls[:extends] ? "@extends " + cls[:extends] : nil,
        cls[:singleton] ? "@singleton" : nil,
        cls[:xtype] ? "@xtype " + cls[:xtype] : nil,
        "",
        cls[:markdown] ? cls[:doc] : html2text(cls[:doc]),
        constructor(cls),
      ].flatten.compact.join("\n") + "\n"
    end

    def method(m)
      return [
        method_rest(m),
      ].flatten.compact.join("\n") + "\n"
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
      ]
    end

    def param(p)
      return [
        "@param",
        type(p[:type]),
        p[:name],
        p[:doc] != "" ? html2text(p[:doc]) : nil,
      ].compact.join(" ")
    end

    def retrn(r)
      return nil if !r || r[:type] == "void" && r[:doc] == ""

      return [
        "@return",
        r[:type] != "void" ? type(r[:type]) : nil,
        r[:doc] != "" ? html2text(r[:doc]) : nil,
      ].compact.join(" ")
    end

    def type(t)
      t ? "{"+t+"}" : nil
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
