require 'jsduck/render/signature'
require 'jsduck/render/tags'
require 'jsduck/render/sidebar'

module JsDuck
  module Render

    # Renders the whole documentation page for a class.
    class Class
      def initialize(opts)
        @opts = opts
      end

      def render(cls)
        @cls = cls
        @signature = Render::Signature.new(cls)

        return [
          "<div>",
            render_sidebar,
            "<div class='doc-contents'>",
              render_tags(@cls),
            "</div>",
            "<div class='members'>",
              render_all_sections,
            "</div>",
          "</div>",
        ].flatten.compact.join
      end

      private

      def render_tags(member)
        Render::Tags.render(member)
      end

      def render_sidebar
        Render::Sidebar.new(@opts).render(@cls)
      end

      def render_all_sections
        sections = [
          {:type => :property, :title => "Properties"},
          {:type => :method, :title => "Methods"},
          {:type => :event, :title => "Events"},
          {:type => :css_var, :title => "CSS Variables"},
          {:type => :css_mixin, :title => "CSS Mixins"},
        ]

        render_configs_section + sections.map {|sec| render_section(sec) }
      end

      def render_configs_section
        configs = @cls[:members][:cfg] + @cls[:statics][:cfg]

        if configs.length > 0
          required, optional = configs.partition {|c| c[:required] }
          return [
            "<div class='members-section'>",
              required.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
              "<h3 class='members-title icon-cfg'>Config options</h3>",
              render_subsection(required, "Required Config options"),
              render_subsection(optional, required.length > 0 ? "Optional Config options" : nil),
            "</div>",
          ]
        else
          return []
        end
      end

      def render_section(sec)
        members = @cls[:members][sec[:type]]
        statics = @cls[:statics][sec[:type]]

        # Skip rendering empty sections
        if members.length > 0 || statics.length > 0
          return [
            "<div class='members-section'>",
              statics.length == 0 ? "<div class='definedBy'>Defined By</div>" : "",
              "<h3 class='members-title icon-#{sec[:type]}'>#{sec[:title]}</h3>",
              render_subsection(members, statics.length > 0 ? "Instance #{sec[:title]}" : nil),
              render_subsection(statics, "Static #{sec[:title]}"),
            "</div>",
          ]
        else
          return []
        end
      end

      def render_subsection(members, title)
        return if members.length == 0
        index = 0
        return [
          "<div class='subsection'>",
            title ? "<div class='definedBy'>Defined By</div><h4 class='members-subtitle'>#{title}</h3>" : "",
            members.map {|m| index += 1; render_member(m, index == 1) },
          "</div>",
        ]
      end

      def render_member(m, is_first)
        # use classname "first-child" when it's first member in its category
        first_child = is_first ? "first-child" : ""
        # shorthand to owner class
        owner = m[:owner]
        # is this method inherited from parent?
        inherited = (owner != @cls[:name])

        return [
          "<div id='#{m[:id]}' class='member #{first_child} #{inherited ? 'inherited' : 'not-inherited'}'>",
            # leftmost column: expand button
            "<a href='#' class='side expandable'>",
              "<span>&nbsp;</span>",
            "</a>",
            # member name and type + link to owner class and source
            "<div class='title'>",
              "<div class='meta'>",
                inherited ? "<a href='#!/api/#{owner}' rel='#{owner}' class='defined-in docClass'>#{owner}</a>" :
                            "<span class='defined-in' rel='#{owner}'>#{owner}</span>",
                "<br/>",
                @opts.source ? "<a href='source/#{m[:files][0][:href]}' target='_blank' class='view-source'>view source</a>" : "",
              "</div>",
              # method params signature or property type signature
              @signature.render(m),
            "</div>",
            # short and long descriptions
            "<div class='description'>",
              "<div class='short'>",
                m[:shortDoc] ? m[:shortDoc] : m[:doc],
              "</div>",
              "<div class='long'>",
                render_tags(m),
              "</div>",
            "</div>",
          "</div>",
        ]
      end

    end

  end
end
