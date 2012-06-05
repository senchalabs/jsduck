require "jsduck/meta_tag"
require "jsduck/logger"

module JsDuck::Tag
  class Throws < JsDuck::MetaTag
    def initialize
      @name = "throws"
      @key = :throws
      @signature = {:long => "throws", :short => "THR"}
      @multiline = true
    end

    def to_value(tags)
      tags.map do | throws |
        if throws =~ /\A\{([\w\.]+)\}\s+([^ ].*)\Z/m
          {:type => $1, :doc => $2.strip}
        else
          {:type => "Object", :doc => throws}
        end
      end
    end

    def to_html(values)
      return if values.length == 0

      html = values.map do | throws |
        <<-EOHTML
          <li>
            <span class="pre"><a href="#!/api/#{throws[:type]}">#{throws[:type]}</a></span>
            <div class="sub-desc">
              <p>#{throws[:doc]}</p>
            </div>
          </li>
        EOHTML
      end.join

      return <<-EOHTML
        <h3>Throws</h3>
        <ul>
          #{html}
        </ul>
      EOHTML
    end

  end
end
