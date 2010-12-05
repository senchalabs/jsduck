module JsDuck

  # Base class for creating HTML tables of class members.
  #
  # Subclasses must set variables @type, @id, @title, @column_title,
  # @row_class, and implement the signature_suffix() method.
  class Table
    def initialize(cls)
      @cls = cls
      @links = DocLinks.new(cls.full_name)
    end

    def to_html
      rows = @cls.members(@type).collect {|m| row(m) }

      # When no rows to show, create no table whatsoever
      return "" if rows.length == 0

      [
       "<a id='#{@id}'></a>",
       "<h2>#{@title}</h2>",
       "<table cellspacing='0' class='member-table'><tbody>",
       "<tr><th colspan='2' class='sig-header'>#{@column_title}</th><th class='msource-header'>Defined By</th></tr>",
       rows.join("\n"),
       "</tbody></table>",
      ].join("\n")
    end

    def row(item)
      contents = @links.replace(item[:doc])
      expandable = expandable?(contents) ? 'expandable' : ''
      inherited = inherited?(item) ? 'inherited' : ''
      [
       "<tr class='#{@row_class} #{expandable} #{inherited}'>",
         "<td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>",
         "<td class='sig'>#{signature(item)}<div class='mdesc'>#{expandable_desc(contents)}</div></td>",
         "<td class='msource'>#{Class.short_name(item[:member])}</td>",
       "</tr>",
      ].join("")
    end

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#" + id
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b>" + signature_suffix(item)
    end

    # Creates parameter list used in method and event signature.
    def short_param_list(item)
      params = item[:params].collect do |p|
        (p[:type] || "Object") + " " + (p[:name] || "")
      end
      return params.length > 0 ? ("( " + params.join(", ") + " )") : "()"
    end

    # 116 chars is also where ext-doc makes its cut, but unlike
    # ext-doc we only make the cut when there's more than 120 chars.
    #
    # This way we don't get stupid expansions like:
    #
    #   Blah blah blah some text...
    #
    # expanding to:
    #
    #   Blah blah blah some text.
    #
    def expandable_desc(doc)
      expandable?(doc) ? "<div class='short'>#{strip_tags(doc)[0..116]}...</div><div class='long'>#{doc}</div>" : doc
    end

    def expandable?(doc)
      strip_tags(doc).length > 120
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end

    def inherited?(item)
      item[:member] != @cls.full_name
    end

  end

end
