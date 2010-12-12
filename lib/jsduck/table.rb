require 'jsduck/doc_formatter'

module JsDuck

  # Base class for creating HTML tables of class members.
  #
  # Subclasses must set variables @type, @id, @title, @column_title,
  # @row_class, and implement the signature_suffix() and extra_doc()
  # methods.
  class Table
    def initialize(cls)
      @cls = cls
      @formatter = DocFormatter.new(cls.full_name)
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
      p_doc = primary_doc(item)
      e_doc = extra_doc(item)
      description = expandable_desc(p_doc, e_doc)
      expandable = expandable?(p_doc, e_doc) ? 'expandable' : ''
      inherited = inherited?(item) ? 'inherited' : ''
      source = inherited?(item) ? member_link(item) : Class.short_name(item[:member])
      [
       "<tr class='#{@row_class} #{expandable} #{inherited}'>",
         "<td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>",
         "<td class='sig'>#{signature(item)}<div class='mdesc'>#{description}</div></td>",
         "<td class='msource'>#{source}</td>",
       "</tr>",
      ].join("")
    end

    def member_link(item)
      cls = item[:member]
      member = item[:name]
      "<a href='output/#{cls}.html##{member}' " +
        "ext:member='##{member}' " +
        "ext:cls='#{cls}'>#{Class.short_name(cls)}</a>"
    end

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/sample.html#" + id
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b>" + signature_suffix(item)
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
    def expandable_desc(p_doc, e_doc)
      if expandable?(p_doc, e_doc)
        # Only show ellipsis when primary_doc is shortened.
        tagless = strip_tags(p_doc)
        short_doc = tagless[0..116]
        ellipsis = tagless.length > short_doc.length ? "..." : ""
        "<div class='short'>#{short_doc}#{ellipsis}</div>" +
          "<div class='long'>#{p_doc}#{e_doc}</div>"
      else
        p_doc
      end
    end

    def primary_doc(item)
      @formatter.format(item[:doc])
    end

    # Override to append extra documentation to the doc found in item[:doc]
    def extra_doc(item)
      ""
    end

    def expandable?(p_doc, e_doc)
      strip_tags(p_doc).length > 120 || e_doc.length > 0
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end

    def inherited?(item)
      item[:member] != @cls.full_name
    end

  end

end
