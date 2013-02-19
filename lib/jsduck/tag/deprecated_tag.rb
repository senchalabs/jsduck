require "jsduck/tag/tag"

module JsDuck::Tag
  # Base class for both @deprecated and @removed.  Child classes only
  # need to define the @tagname attribute and call #super - all the
  # correct behavior will the fall out automatically.
  class DeprecatedTag < Tag
    def initialize
      if @tagname
        @pattern = @tagname.to_s
        @signature = {:long => @tagname.to_s, :short => @tagname.to_s[0..2].upcase}
        @html_position = POS_DEPRECATED
        @css += <<-EOCSS
          .deprecated-tag-box {
            text-align: center;
            color: #600;
            background-color: #fee;
          }
          .deprecated-tag-box strong {
            text-transform: uppercase;
            border-radius: 2px;
            padding: 0 3px;
          }
        EOCSS
      end
    end

    def parse_doc(p)
      {
        :tagname => @tagname,
        :version => p.hw.match(/[0-9.]+/),
        :doc => :multiline,
      }
    end

    def process_doc(h, tags, pos)
      v = {:text => tags[0][:doc] || ""}
      v[:version] = tags[0][:version] if tags[0][:version]
      h[@tagname] = v
    end

    def format(context, formatter)
      context[@tagname][:text] = formatter.format(context[@tagname][:text])
    end

    def to_html(context)
      depr = context[@tagname]
      v = depr[:version] ? "since " + depr[:version] : ""
      <<-EOHTML
        <div class='rounded-box #{@tagname}-box deprecated-tag-box'>
        <p>This #{context[:tagname]} has been <strong>#{@tagname}</strong> #{v}</p>
        #{depr[:text]}
        </div>
      EOHTML
    end

  end
end
