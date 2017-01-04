require "jsduck/meta_tag"

module JsDuck::Tag
  # Implementation of @preventable tag
  class Preventable < JsDuck::MetaTag
    def initialize
      @name = "preventable"
      @key = :preventable
      @signature = {:long => "preventable", :short => "PREV"}
    end

    # @preventable is optionally followed by some method name, but we
    # don't document it.
    def to_value(contents)
      true
    end

    def to_html(v)
      <<-EOHTML
        <div class='signature-box preventable'>
        <p>This action following this event is <b>preventable</b>.
        When any of the listeners returns false, the action is cancelled.</p>
        </div>
      EOHTML
    end
  end
end

