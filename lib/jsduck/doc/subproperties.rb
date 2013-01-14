require 'jsduck/util/singleton'

module JsDuck
  module Doc

    # Detects nested structure of subproperties.
    class Subproperties
      include Util::Singleton

      # Given array of e.g. @param tags from Doc::Parser with names
      # containing dots:
      #
      #     {:name => "foo"},
      #     {:name => "foo.bar"},
      #     {:name => "foo.baz"},
      #     {:name => "zap"},
      #
      # Produces nested structure:
      #
      #     {:name => "foo", :properties => [
      #         {:name => "bar"},
      #         {:name => "baz"}]},
      #     {:name => "zap"},
      #
      # NOTE: It returns two values: the resulting nested items array
      # and warnings array of :subproperty warnings that should get
      # printed out.
      def nest(raw_items)
        # First item can't be namespaced, if it is ignore the rest.
        if raw_items[0] && raw_items[0][:name] =~ /\./
          return [raw_items[0]], []
        end

        # build name-index of all items
        index = {}
        raw_items.each {|it| index[it[:name]] = it }

        # If item name has no dots, add it directly to items array.
        # Otherwise look up the parent of item and add it as the
        # property of that parent.
        items = []
        warnings = []
        raw_items.each do |it|
          if it[:name] =~ /^(.+)\.([^.]+)$/
            it[:name] = $2
            parent = index[$1]
            if parent
              parent[:properties] = [] unless parent[:properties]
              parent[:properties] << it
            else
              warnings << "Ignoring subproperty #{$1}.#{$2}, no parent found with name '#{$1}'."
            end
          else
            items << it
          end
        end

        return items, warnings
      end

    end

  end
end
