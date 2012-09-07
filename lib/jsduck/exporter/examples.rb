require 'jsduck/inline_examples'

module JsDuck
  module Exporter

    # Exporter for inline examples.
    #
    # It produces the following structure:
    #
    # {
    #   :type => :class,  # can also be :guide
    #   :name => "Panel",
    #   :examples => [
    #     {:code => "bla bla", :options => {}},
    #     {:code => "bla bla", :options => {"raw" => true}},
    #     ...
    #   ]
    # }
    #
    class Examples
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
            :type => :class,
            :name => cls[:name],
            :examples => examples,
          }
        else
          nil
        end
      end

      # Returns hash of guide name and inline examples
      def export_guide(guide)
        examples = @inline_examples.extract(guide[:html] || "")
        if examples.length > 0
          {
            :type => :guide,
            :name => guide["name"],
            :examples => examples,
          }
        else
          nil
        end
      end

    end

  end
end
