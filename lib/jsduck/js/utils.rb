module JsDuck
  module Js

    # Helpers for handling the parsing of Ext.define definitions
    class Utils
      # When the value is string, returns the string, otherwise nil
      def self.make_string(ast)
        str = ast.to_value
        str.is_a?(String) ? str : nil
      end

      # When the value is string or array of strings, returns array of
      # strings. In any other case, returns empty array.
      def self.make_string_list(ast)
        strings = Array(ast.to_value)
        strings.all? {|s| s.is_a?(String) } ? strings : []
      end
    end

  end
end
