module JsDuck

  # Creates HTML documentation page for one class.
  class Page
    def initialize(cls)
      @cls = cls
    end

    def to_html
      [
       '<div xmlns:ext="http://www.extjs.com" class="body-wrap">',
       heading,
       abstract,
       description,
       "</div>",
      ].join("\n")
    end

    def heading
      "<h1>Class <a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.full_name}</a></h1>"
    end

    def abstract
      [
       "<table cellspacing='0'>",
       abstract_row("Package:", @cls.package_name),
       abstract_row("Defined In:", "sample.js"),
       abstract_row("Class:", "<a href='source/sample.html#cls-#{@cls.full_name}'>#{@cls.short_name}</a>"),
       abstract_row("Extends:", @cls[:extends] || "Object"),
       "</table>",
      ].join("\n")
    end

    def abstract_row(label, info)
      "<tr><td class='label'>#{label}</td><td class='hd-info'>#{info}</td></tr>"
    end

    def description
      "<div class='description'>#{@cls[:doc]}</div>"
    end
  end

end
