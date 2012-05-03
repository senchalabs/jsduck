require 'jsduck/json_duck'
require 'cgi'

module JsDuck

  # Extracts inline examples from formatted docs and writes to file
  class InlineExamples
    def initialize(relations)
      @begin_example_re = /<pre class='inline-example ([^']*)'><code>/
      @end_example_re = /<\/code><\/pre>/

      @examples = []
      relations.each do |cls|
        extract(cls[:doc]).each_with_index do |ex, i|
          @examples << {
            :id => cls.full_name + "-" + i.to_s,
            :name => cls.full_name + " example #" + (i+1).to_s,
            :href => '#!/api/' + cls.full_name,
            :code => ex,
          }
        end
      end
    end

    def write(filename)
      JsonDuck.write_jsonp(filename, "__inline_examples__", @examples)
    end

    # Extracts inline examples from HTML
    def extract(html)
      examples = []

      s = StringScanner.new(html)
      while !s.eos? do
        if s.check(/</)
          if s.check(@begin_example_re)
            s.scan(@begin_example_re)
            ex = s.scan_until(@end_example_re).sub(@end_example_re, '')
            examples << CGI.unescapeHTML(strip_tags(ex))
          else
            s.skip(/</)
          end
        else
          s.skip(/[^<]+/)
        end
      end

      examples
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end
  end

end
