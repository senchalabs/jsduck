module JsDuck
  module Render

    # Helper method for rendering the link in method/property signature
    class SignatureUtil

      def self.link(class_name, member_id, text)
        "<a href='#!/api/#{class_name}-#{member_id}' class='name expandable'>#{text}</a>"
      end

    end

  end
end
