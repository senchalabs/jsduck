require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @template tag
  class Template < JsDuck::MetaTag
    def initialize
      @name = "template"
      @key = :template
      @signature = {:long => "template", :short => "TMP"}
      @boolean = true
    end

    def to_html(contents)
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

