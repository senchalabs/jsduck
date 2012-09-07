require 'jsduck/util/json'
require 'jsduck/util/html'

module JsDuck

  # Extracts inline examples from formatted docs and writes to file
  class InlineExamples
    def initialize
      @begin_example_re = /<pre class='inline-example ([^']*)'><code>/
      @end_example_re = /<\/code><\/pre>/
      @examples = []
    end

    # Extracts inline examples from classes
    def add_classes(relations)
      relations.each do |cls|
        extract(cls[:doc]).each_with_index do |ex, i|
          @examples << {
            :id => cls[:name] + "-" + i.to_s,
            :name => cls[:name] + " example #" + (i+1).to_s,
            :href => '#!/api/' + cls[:name],
            :code => ex[:code],
            :options => ex[:options],
          }
        end
      end

      self
    end

    # Extracts inline examples from guides
    def add_guides(guides)
      guides.each_item do |guide|
        extract(guide[:html]).each_with_index do |ex, i|
          @examples << {
            :id => guide["name"] + "-" + i.to_s,
            :name => guide["title"] + " example #" + (i+1).to_s,
            :href => '#!/guide/' + guide["name"],
            :code => ex[:code],
            :options => ex[:options],
          }
        end
      end

      self
    end

    # Writes all found examples to .js file
    def write(filename)
      Util::Json.write_jsonp(filename, "__inline_examples__", @examples)
    end

    # Extracts inline examples from HTML
    def extract(html)
      examples = []

      s = StringScanner.new(html)
      while !s.eos? do
        if s.check(/</)
          if s.check(@begin_example_re)

            s.scan(@begin_example_re) =~ @begin_example_re
            options = build_options_hash($1)

            ex = s.scan_until(@end_example_re).sub(@end_example_re, '')

            examples << {
              :code => Util::HTML.unescape(Util::HTML.strip_tags(ex)),
              :options => options,
            }
          else
            s.skip(/</)
          end
        else
          s.skip(/[^<]+/)
        end
      end

      examples
    end

    private

    def build_options_hash(css_classes)
      hash = {}
      css_classes.split(/ +/).each do |k|
        hash[k] = true
      end
      hash
    end

  end

end
