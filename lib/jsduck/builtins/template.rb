require "jsduck/builtins/boolean_tag"

module JsDuck::Builtins
  class Template < BooleanTag
    def initialize
      @key = :template
      @signature = {:long => "template", :short => "TMP"}
      @html_position = :bottom
      super
    end

    def to_html(context, formatter)
      <<-EOHTML
      <div class='signature-box template'>
      <p>This is a <a href="#!/guide/components">template method</a>.
         a hook into the functionality of this class.
         Feel free to override it in child classes.</p>
      </div>
      EOHTML
    end
  end
end
