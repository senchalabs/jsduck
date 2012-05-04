require 'jsduck/inline_examples'

module JsDuck

  # Exporter for inline examples.
  #
  # It produces the following structure:
  #
  # {
  #   :name => "Panel",
  #   :examples => [
  #     {:code => "bla bla", :options => {}},
  #     {:code => "bla bla", :options => {"raw" => true}},
  #     ...
  #   ]
  # }
  #
  class ExamplesExporter
    def initialize(relations, opts)
      # All params ignored, they're present to be compatible with
      # other exporters.
      @inline_examples = InlineExamples.new
    end

    # Returns hash of class name and inline examples
    def export(cls)
      examples = @inline_examples.extract(cls[:doc])
      if examples.length > 0
        {
          :name => cls[:name],
          :examples => examples,
        }
      else
        nil
      end
    end

    # Returns hash of guide name and inline examples
    def export_guide(guide, html)
      examples = @inline_examples.extract(html)
      if examples.length > 0
        {
          :name => guide["name"],
          :examples => examples,
        }
      else
        nil
      end
    end

  end

end
