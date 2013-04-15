require 'jsduck/render/tags'
require 'jsduck/render/sidebar'
require 'jsduck/tag_registry'

module JsDuck
  module Render

    # Renders the whole documentation page for a class.
    class Class
      def initialize(opts)
        @opts = opts
      end

      def render(cls)
        @cls = cls

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
        TagRegistry.member_types.map do |member_type|
          render_section(member_type)
        end
      end

      def render_section(sec)
        members = @cls[:members].find_all {|m| m[:tagname] == sec[:name] }

        # Skip rendering empty sections
        return [] if members.length == 0

        # Split members array into subsections
        subsections = Array(sec[:subsections]).map do |subsec|
          ms = members.find_all {|m| test_filter(m, subsec[:filter]) }
          if ms.length > 0
            {:title => subsec[:title], :members => ms, :default => subsec[:default]}
          else
            nil
          end
        end.compact

        # Print no subsections when no subsections defined or there's
        # just single subsection which is the default one.
        if subsections.length == 0 || subsections.length == 1 && subsections[0][:default]
          return [
            "<div class='members-section'>",
              "<div class='definedBy'>Defined By</div>",
              "<h3 class='members-title icon-#{sec[:name]}'>#{sec[:title]}</h3>",
              render_subsection(members, nil),
            "</div>",
          ]
        end

        return [
          "<div class='members-section'>",
          "<h3 class='members-title icon-#{sec[:name]}'>#{sec[:title]}</h3>",
          subsections.map {|ss| render_subsection(ss[:members], ss[:title]) },
          "</div>",
        ]
      end

      # Returns true if member matches the conditions described by a
      # subsection filter.
      def test_filter(member, filter)
        filter.each_pair do |field, truthy|
          return false unless truthy ? member[field] : !member[field]
        end
        return true
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
              render_member_signature(m),
              render_tag_signature(m),
            "</div>",
            # short and long descriptions
            "<div class='description'>",
              "<div class='short'>",
                m[:short_doc] ? m[:short_doc] : m[:doc],
              "</div>",
              "<div class='long'>",
                render_tags(m),
              "</div>",
            "</div>",
          "</div>",
        ]
      end

      def render_member_signature(m)
        TagRegistry.get_by_name(m[:tagname]).to_html(m, @cls)
      end

      def render_tag_signature(m)
        Render::Tags.render_signature(m)
      end

    end

  end
end
