require "jsduck/tag_registry"

module JsDuck
  module Js

    # Access to Ext.define-related Tag configs.
    class ExtDefine
      class << self

        # Default values for class config when Ext.define is encountered.
        def defaults
          return @defaults if @defaults

          @defaults = {}
          TagRegistry.tags.each do |tag|
            if tag.ext_define_default
              @defaults.merge!(tag.ext_define_default)
            end
          end
          @defaults
        end

        # Accesses tag by Ext.define pattern
        def get_tag_by_pattern(name)
          patterns[name]
        end

        private

        def patterns
          return @patterns if @patterns

          @patterns = {}
          TagRegistry.tags.each do |tag|
            Array(tag.ext_define_pattern).each do |pattern|
              @patterns[pattern] = tag
            end
          end
          @patterns
        end

      end
    end

  end
end
