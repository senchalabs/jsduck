require 'sass'

module JsDuck
  module Css

    # Parses SCSS using the official SASS parser.
    class SassParser
      def initialize(input, options = {})
        @input = input
        @docs = []
      end

      # Returns an array of docsets like the Js::Parser does.
      def parse
        root = Sass::Engine.new(@input, :syntax => :scss).to_tree
        find_doc_comments(root.children)
        @docs
      end

      private

      def find_doc_comments(nodes)
        prev_comment = nil

        nodes.each do |node|
          if node.class == Sass::Tree::CommentNode
            if node.type == :normal && node.value[0] =~ /\A\/\*\*/
              prev_comment = node.value[0]
            else
              prev_comment = nil
            end
          elsif prev_comment
            @docs << {
              :comment => prev_comment,
              :linenr => 0,
              :code => analyze_code(node),
              :type => :doc_comment,
            }
            prev_comment = nil
          end

          find_doc_comments(node.children)
        end
      end

      def analyze_code(node)
        if node.class == Sass::Tree::VariableNode
          return {
            :tagname => :css_var,
            :name => "$" + node.name,
            :default => node.expr.to_s,
            :type => detect_type(node.expr),
          }
        elsif node.class == Sass::Tree::MixinDefNode
          return {
            :tagname => :css_mixin,
            :name => node.name,
            :params => build_params(node.args),
          }
        else
          # Default to property like in Js::Parser.
          return {:tagname => :property}
        end
      end

      def build_params(mixin_args)
        mixin_args.map do |arg|
          {
            :name => "$" + arg[0].name,
            :default => arg[1] ? arg[1].to_s : nil,
            :type => arg[1] ? detect_type(arg[1]) : nil,
          }
        end
      end

      def detect_type(node)
        if LITERAL_TYPES[node.class]
          LITERAL_TYPES[node.class]
        elsif node.class == Sass::Script::Funcall && COLOR_FUNCTIONS[node.name]
          "color"
        else
          nil
        end
      end

      LITERAL_TYPES = {
        Sass::Script::Number => "number",
        Sass::Script::String => "string",
        Sass::Script::Color => "color",
        Sass::Script::Bool => "boolean",
        Sass::Script::List => "list",
      }

      COLOR_FUNCTIONS = {
        # CSS3 builtins
        "rgb" => true,
        "rgba" => true,
        "hsl" => true,
        "hsla" => true,
        # SASS builtins
        "mix" => true,
        "adjust-hue" => true,
        "lighten" => true,
        "darken" => true,
        "saturate" => true,
        "desaturate" => true,
        "grayscale" => true,
        "complement" => true,
        "invert" => true,
        "opacify" => true,
        "fade-in" => true,
        "transparentize" => true,
        "fade-out" => true,
        "adjust-color" => true,
        "scale-color" => true,
        "change-color" => true,
      }

    end

  end
end
