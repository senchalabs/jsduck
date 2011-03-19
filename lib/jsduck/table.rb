require 'jsduck/doc_formatter'

module JsDuck

  # Base class for creating HTML tables of class members.
  #
  # Subclasses must set variables @type, @id, @title, @column_title,
  # @row_class, and implement the signature_suffix() and extra_doc()
  # methods.
  class Table
    # Initializes class member table generator
    #
    # - cls : the class for which to generate the table.
    #
    # - cache : shared cache of already generated HTML rows.  If Foo
    #   inherits from Bar and we have already generated members table
    #   for Bar, then we don't have to re-render all the HTML the
    #   methods from Bar, but can just look them up from cache.
    #
    def initialize(cls, cache={})
      @cls = cls
      @cache = cache
      @formatter = DocFormatter.new
      @formatter.context = cls.full_name
      @formatter.css_class = 'docClass'
      @formatter.url_template = 'output/%cls%.html'
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

    # Returns HTML row for class member.
    #
    # When HTML for member has already been rendered we can pick it
    # from cache and only fill in some details which differ from class
    # to class.
    #
    # Otherwise perform the rendering of HTML and save it to cache.
    def row(item)
      cache_key = "#{item[:member]}-#{@row_class}-#{item[:name]}"
      if @cache[cache_key]
        html = @cache[cache_key]
      else
        html = @cache[cache_key] = create_row(item)
      end
      inherited = inherited?(item) ? 'inherited' : ''
      owner = inherited?(item) ? member_link(item) : Class.short_name(item[:member])
      html.sub(/!!--inherited--!!/, inherited).sub(/!!--owner-class--!!/, owner)
    end

    # Generates HTML for the row, leaving in placeholders for owner
    # class name and inherited class.
    def create_row(item)
      p_doc = primary_doc(item)
      e_doc = extra_doc(item)
      description = expandable_desc(p_doc, e_doc)
      expandable = expandable?(p_doc, e_doc) ? 'expandable' : ''
      return <<-EOHTML
      <tr class='#{@row_class} #{expandable} !!--inherited--!!'>
        <td class='micon'><a href='#expand' class='exi'>&nbsp;</a></td>
        <td class='sig'>#{signature(item)}<div class='mdesc'>#{description}</div></td>
        <td class='msource'>!!--owner-class--!!</td>
      </tr>
      EOHTML
    end

    def member_link(item)
      cls = item[:member]
      member = item[:name]
      "<a href='output/#{cls}.html##{member}' " +
        "class='docClass' " +
        "rel='#{cls}##{member}'>#{Class.short_name(cls)}</a>"
    end

    def signature(item)
      id = @cls.full_name+ "-" + item[:name]
      src = "source/#{item[:href]}"
      return "<a id='#{id}'></a><b><a href='#{src}'>#{item[:name]}</a></b>" + signature_suffix(item)
    end

    # Creates either expandable or normal doc-entry
    def expandable_desc(p_doc, e_doc)
      if expandable?(p_doc, e_doc)
        short_doc = @formatter.shorten(p_doc)
        "<div class='short'>#{short_doc}</div>" +
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
      @formatter.too_long?(p_doc) || e_doc.length > 0
    end

    def inherited?(item)
      item[:member] != @cls.full_name
    end

  end

end
