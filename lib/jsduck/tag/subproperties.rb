require "jsduck/tag/tag"
require "jsduck/render/subproperties"

module JsDuck::Tag
  # There is no @subproperties tag.
  #
  # This tag class exists solely to implement rendering of :properties
  # field which can exist in :cfg, :property or :css_var members.
  class Subproperties < Tag
    def initialize
      @key = :properties
      @html_position = POS_SUBPROPERTIES
    end

    def format(m, formatter)
      m[:properties].each {|p| formatter.format_subproperty(p) }
    end

    def to_html(m)
      JsDuck::Render::Subproperties.render(m)
    end
  end
end
