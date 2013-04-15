require 'jsduck/util/singleton'
require 'jsduck/render/signature_util'

module JsDuck
  module Render

    # Performs the rendering of method signatures.
    class MethodSignature
      include JsDuck::Util::Singleton

      # Renders signature of the given method/event/scss_mixin.
      # The class config is needed for naming the constructor the same as class.
      def render(member, cls)
        @m = member
        @cls = cls

        return [
          render_new,
          render_link,
          render_params,
          render_return,
        ].join
      end

      private

      def render_new
        constructor? ? "<strong class='new-keyword'>new</strong>" : ""
      end

      def render_link
        SignatureUtil::link(@m[:owner], @m[:id], render_name)
      end

      def render_name
        constructor? ? @cls[:name] : @m[:name]
      end

      def constructor?
        @m[:tagname] == :method && @m[:name] == "constructor"
      end

      def render_params
        ps = @m[:params].map {|p| render_single_param(p) }.join(", ")
        "( <span class='pre'>#{ps}</span> )"
      end

      def render_single_param(param)
        param[:optional] ? "["+param[:name]+"]" : param[:name]
      end

      def render_return
        method_with_return? ? (" : " + @m[:return][:html_type]) : ""
      end

      def method_with_return?
        @m[:return] != nil
      end

    end

  end
end
