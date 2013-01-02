require "jsduck/builtins/tag"

module JsDuck::Builtins
  # That's pretty much a boolean tag, but we don't inherit from
  # BooleanTag as unlike other boolean tags it can be followed by some
  # text.
  class Preventable < Tag
    def initialize
      @pattern = "preventable"
      @key = :preventable
      @signature = {:long => "preventable", :short => "PREV"}
      @html_position = :bottom
    end

    # @preventable is optionally followed by some method name, but we
    # don't document it.
    def parse(p)
      p.add_tag(@key)
      p.match(/.*$/)
    end

    def process_doc(docs)
      true
    end

    def to_html(context, formatter)
      <<-EOHTML
        <div class='signature-box preventable'>
        <p>This action following this event is <b>preventable</b>.
        When any of the listeners returns false, the action is cancelled.</p>
        </div>
      EOHTML
    end
  end
end
