require "jsduck/tag/boolean_tag"

class ExperimentalTag < JsDuck::Tag::BooleanTag
  def initialize
    @pattern = "experimental"
    @signature = {:long => "experimental", :short => "EXP"}
    @html_position = POS_DOC
    @css = <<-EOCSS
      .signature .experimental {
        background-color: #bedbaf;
      }
      .inner-box {
        color: #ccc;
        border: 2px dashed #ddd;
        font-size: 125%;
        padding: 12px;
        border-radius:6px;
        margin-bottom:12px;
      }
    EOCSS
    super
  end

  def to_html(context)
    "<div class='rounded-box inner-box'>
      <p>This is an experimental feature that is not officially supported (yet).</p>
     </div>"
  end
end