require "jsduck/tag/boolean_tag"

module JsDuck::Tag
  # The @component tag should be rarely used explicitly as it gets
  # auto-detected by Process::Components for any component inheriting
  # from Ext.Component.
  class Component < BooleanTag
    def initialize
      @pattern = "component"
      super
    end
  end
end
