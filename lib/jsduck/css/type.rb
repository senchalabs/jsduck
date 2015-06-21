require 'sass'

module JsDuck
  module Css

    class Type
      # Given SASS expression node, determines its type.
      # When unknown, return nil.
      def detect(node)
        if node.class == Sass::Script::Tree::Literal && LITERAL_TYPES[node.value.class]
          LITERAL_TYPES[node.value.class]
        elsif node.class == Sass::Script::Funcall && COLOR_FUNCTIONS[node.name]
          "color"
        else
          nil
        end
      end

      LITERAL_TYPES = {
        Sass::Script::Value::Number => "number",
        Sass::Script::Value::String => "string",
        Sass::Script::Value::Color => "color",
        Sass::Script::Value::Bool => "boolean",
        Sass::Script::Value::List => "list",
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
