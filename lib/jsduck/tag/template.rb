require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  class Template < BooleanTag
    def initialize
      @pattern = "template"
      @signature = {:long => "template", :short => "TMP"}
      @html_position = POS_TEMPLATE
      # Box with light gray background
      @css = <<-EOCSS
        .template-box {
          text-align: center;
          background-color: #eee;
        }
      EOCSS
      super
    end

    def to_html(context)
      <<-EOHTML
      <div class='rounded-box template-box'>
      <p>This is a <a href="#!/guide/components">template method</a>.
         a hook into the functionality of this class.
         Feel free to override it in child classes.</p>
      </div>
      EOHTML
    end
  end
end
