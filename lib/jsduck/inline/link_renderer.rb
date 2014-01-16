require 'jsduck/util/html'

module JsDuck
  module Inline

    # Renders HTML link to class or member.
    class LinkRenderer
      # Access to relations object, used by Inline::Link and
      # Inline::AutoLink.
      attr_reader :relations

      def initialize(relations={}, opts={})
        @relations = relations

        # Template HTML that replaces {@link Class#member anchor text}.
        # Can contain placeholders:
        #
        # %c - full class name (e.g. "Ext.Panel")
        # %m - class member name prefixed with member type (e.g. "method-urlEncode")
        # %# - inserts "#" if member name present
        # %- - inserts "-" if member name present
        # %a - anchor text for link
        @tpl = opts[:link_tpl] || '<a href="%c%#%m">%a</a>'
      end

      # Generates HTML link to class or member applying the link
      # template.
      def link(cls, member, anchor_text, type=nil, static=nil)
        # Use the canonical class name for link (not some alternateClassName)
        cls = @relations[cls][:name]
        # prepend type name to member name
        member = member && get_matching_member(cls, {:name => member, :tagname => type, :static => static})

        @tpl.gsub(/(%[\w#-])/) do
          case $1
          when '%c'
            cls
          when '%m'
            member ? member[:id] : ""
          when '%#'
            member ? "#" : ""
          when '%-'
            member ? "-" : ""
          when '%a'
            Util::HTML.escape(anchor_text||"")
          else
            $1
          end
        end
      end

      def get_matching_member(cls, query)
        ms = find_members(cls, query)
        if ms.length > 1
          instance_ms = ms.find_all {|m| !m[:meta][:static] }
          instance_ms.length > 0 ? instance_ms[0] : ms.find_all {|m| m[:meta][:static] }[0]
        else
          ms[0]
        end
      end

      def find_members(cls, query)
        @relations[cls] ? @relations[cls].find_members(query) : []
      end

    end

  end
end
