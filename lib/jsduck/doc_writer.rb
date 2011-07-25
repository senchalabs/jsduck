require 'fileutils'

module JsDuck

  # Rewrites doc-comment contents from already parsed doc-object.
  class DocWriter

    LINE_LENGTH = 120

    # Creates doc-comment of particular type.
    #
    # Returns new doc-comment as string or nil when no replacement
    # should be made (like when @cfg defined inside @class comment).
    def write(type, doc)
      # skip @cfg-s inside @class doc-comment
      return if !doc[:orig_comment]
      ilen = indent_length(doc[:orig_comment])
      @wrap = LINE_LENGTH - ilen - 3
      to_comment(self.send(type, doc).flatten.compact.join("\n"), ilen)
    end

    # Surrounds comment within /** ... */
    # Indents it the same amount as original comment we're replacing.
    # Also trims trailing whitespace and double empty lines.
    def to_comment(raw_lines, ilen)
      indent = " " * ilen
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

    # measure the indentation of last line in comment
    def indent_length(comment)
      lines = comment.split(/\n/)
      m = lines.last.match(/^( *) \*/)
      m ? m[1].length : 0
    end

    # The following methods produce the actual comment contents.  They
    # return either array, string, or nil.  Nils are removed, arrays
    # flattened, and each string is converted to a line.

    def class(cls)
      return [
        at_class(cls),
        at_extends(cls),
        cls[:singleton] ? "@singleton" : nil,
        cls[:xtype] ? "@xtype " + cls[:xtype] : nil,
        cls[:author] ? "@author " + cls[:author] : nil,
        cls[:docauthor] ? "@docauthor " + cls[:docauthor] : nil,
        privat(cls[:private]),
        "",
        maybe_html2text(cls),
        # configs defined inside class-comment
        cls[:members][:cfg].find_all {|c| !c[:orig_comment] }.map {|c| cfg(c) },
        constructor(cls),
      ]
    end

    # creates @class when not detectable from source code
    def at_class(cls)
      if cls[:code][:type] == :ext_define && cls[:code][:name] == cls[:name]
        nil
      else
        "@class " + cls[:name]
      end
    end

    # creates @extends when not detectable from source code
    def at_extends(cls)
      if cls[:code][:type] == :ext_define && cls[:code][:extend] == cls[:extends]
        nil
      elsif cls[:extends]
        "@extends " + cls[:extends]
      else
        nil
      end
    end

    def method(m)
      return [
        # add explicit @method and @member when it's used in original source
        m[:orig_comment] =~ /@method/ ? "@method " + m[:name] : nil,
        m[:orig_comment] =~ /@member/ ? "@member " + m[:owner] : nil,
        method_rest(m),
      ]
    end

    def event(e)
      return [
        "@event " + e[:name],
        method_rest(e),
      ]
    end

    def property(p)
      property_rest(p, "@property")
    end

    def cfg(c)
      property_rest(c, "@cfg")
    end

    def constructor(cls)
      con = cls[:members][:method].find {|m| m[:name] == "constructor" }
      return nil if !con

      return [
        "",
        "@constructor",
        method_rest(con),
      ]
    end

    # the part shared of cfg and property
    def property_rest(p, at_tag)
      return [
        maybe_html2text({
            :doc => [
              at_tag,
              type(p[:type]),
              p[:name],
            ].compact.join(" "),
            :markdown => p[:markdown],
          }),
        maybe_html2text(p),
        privat(p[:private]),
        protect(p[:protected]),
        static(p[:static]),
        inheritable(p[:inheritable]),
        aliass(p[:alias]),
      ]
    end

    # the part shared by both normal method and constructor
    def method_rest(m)
      return [
        m[:doc] != "" ? maybe_html2text(m) : nil,
        m[:params].map {|p| param(p) },
        retrn(m[:return]),
        privat(m[:private]),
        protect(m[:protected]),
        static(m[:static]),
        inheritable(m[:inheritable]),
        aliass(m[:alias]),
      ]
    end

    def param(p)
      return html2text([
        "@param",
        type(p[:type]),
        p[:name],
        doc(p[:doc]),
      ].compact.join(" "))
    end

    def retrn(r)
      return nil if !r || r[:type] == "undefined" && r[:doc] == ""

      return html2text([
        "@return",
        type(r[:type], "undefined"),
        doc(r[:doc]),
      ].compact.join(" "))
    end

    def type(t, default=nil)
      t && t != default ? "{"+t+"}" : nil
    end

    def doc(d)
      d != "" ? d : nil
    end

    def privat(p)
      p ? "@private" : nil
    end

    def protect(p)
      p ? "@protected" : nil
    end

    def static(s)
      s ? "@static" : nil
    end

    def inheritable(s)
      s ? "@inheritable" : nil
    end

    def aliass(a)
      a ? "@alias #{a[:cls]}##{a[:member]}" : nil
    end

    # Convert :doc property to markdown only if no @markdown tag already
    def maybe_html2text(item)
      item[:markdown] ? item[:doc] : html2text(item[:doc])
    end

    # Does HTML to Markdown magic using python script.
    def html2text(html)
      File.open("temp.html", 'w') {|f| f.write(html) }
      `python html2text.py --wrap #{@wrap} temp.html > temp.text`
      text = IO.read("temp.text")
      FileUtils.rm("temp.html")
      FileUtils.rm("temp.text")
      return text.strip
    end
  end

end
