require 'sass'

module JsDuck
  module Css

    class Type
      # Given SASS expression node, determines its type.
      # When unknown, return nil.
      def detect(node)
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
