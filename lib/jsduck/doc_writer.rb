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
        html2text(cls[:doc]),
        constructor(cls),
      ].flatten.compact.join("\n") + "\n"
    end

    def constructor(cls)
      con = cls[:method].find {|m| m[:name] == "constructor" }
      return nil if !con

      return [
        "",
        "@constructor",
        html2text(con[:doc]),
        con[:params].map {|p| param(p) }
      ]
    end

    def param(p)
      return [
        "@param",
        p[:type] ? "{"+p[:type]+"}" : nil,
        p[:name],
        html2text(p[:doc]),
      ].compact.join(" ")
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
