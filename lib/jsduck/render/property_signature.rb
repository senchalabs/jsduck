require 'jsduck/util/singleton'
require 'jsduck/render/signature_util'

module JsDuck
  module Render

    # Performs the rendering of property signatures.
    class PropertySignature
      include JsDuck::Util::Singleton

      # Renders signature of the given property/cfg/scss_var.
      def render(member)
        @m = member

        return [
          render_link,
          render_type,
        ].join
      end

      private

      def render_link
        SignatureUtil::link(@m[:owner], @m[:id], @m[:name])
      end

      def render_type
        "<span> : #{@m[:html_type]}</span>"
      end

    end

  end
end
