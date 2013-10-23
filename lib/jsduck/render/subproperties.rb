require 'jsduck/util/html'
require 'jsduck/util/singleton'

module JsDuck
  module Render

    # Renders params, return values and everything else that can have
    # nested subproperties.
    class Subproperties
      include Util::Singleton

      # Renders object properties, which could also be functions in
      # which case they will be rendered with parameters and return
      # value.
      def render(item)
        doc = []

        if item[:type] == "Function"
          params = item[:properties]
          # If the name of last property is "return" remove it from
          # properties list and format as a return value afterwards.
          if item[:properties].last[:name] == "return"
            ret = params.last
            params = params.slice(0, params.length-1)
          end

          doc << render_params(params)
          doc << render_return(ret) if ret
        else
          doc << render_list(item[:properties])
        end

        doc
      end

      def render_params(params)
        return [
          '<h3 class="pa">Parameters</h3>',
          render_list(params),
        ]
      end

      def render_list(params)
        return [
          "<ul>",
          params.map {|p| render_single_param(p) },
          "</ul>",
        ]
      end

      def render_single_param(p)
        return [
          "<li>",
            "<span class='pre'>#{p[:name]}</span> : ",
            p[:html_type],
            p[:optional] ? " (optional)" : "",
            "<div class='sub-desc'>",
              p[:doc],
              p[:default] ? "<p>Defaults to: <code>#{Util::HTML.escape(p[:default])}</code></p>" : "",
              p[:since] ? "<p>Available since: <b>#{Util::HTML.escape(p[:since])}</b></p>" : "",
              p[:properties] && p[:properties].length > 0 ? render(p) : "",
            "</div>",
          "</li>",
        ]
      end

      def render_return(ret)
        return [
          "<h3 class='pa'>Returns</h3>",
          "<ul>",
            "<li>",
              "<span class='pre'>#{ret[:html_type]}</span>",
              "<div class='sub-desc'>",
                ret[:doc],
                ret[:properties] && ret[:properties].length > 0 ? render(ret) : "",
              "</div>",
            "</li>",
          "</ul>",
        ]
      end

      def render_throws(throws)
        return [
          "<h3 class='pa'>Throws</h3>",
          "<ul>",
            throws.map do |thr|
              [
                "<li>",
                  "<span class='pre'>#{thr[:html_type]}</span>",
                  "<div class='sub-desc'>#{thr[:doc]}</div>",
                "</li>",
              ]
            end,
          "</ul>",
        ]
      end
    end

  end
end
