require "jsduck/tag/tag"

module JsDuck::Tag
  # There is no @overrides tag.  Though there is a separate @override
  # tag, this class here has little to do with it.
  #
  # This here covers the HTML rendering of :overrides field, which
  # gets added to members that override a member in their parent
  # class.
  class Overrides < Tag
    def initialize
      @tagname = :overrides
      @html_position = POS_OVERRIDES
    end

    # Generate HTML links from :overrides data.
    def format(m, formatter)
      m[:overrides].each do |o|
        label = o[:owner] + "." + o[:name]
        o[:link] = formatter.link(o[:owner], o[:name], label, m[:tagname], m[:static])
      end
    end

    def to_html(m)
      "<p>Overrides: " + m[:overrides].map {|o| o[:link] }.join(", ") + "</p>"
    end

  end
end
