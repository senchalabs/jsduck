require 'jsduck/util/singleton'
require 'jsduck/logger'

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
      # Secondly it takes a position argument which is used for
      # logging warnings when bogus subproperty syntax is encountered.
      def nest(raw_items, pos)
        # First item can't be namespaced, if it is ignore the rest.
        if raw_items[0] && raw_items[0][:name] =~ /\./
          warn(raw_items[0][:name], pos)
          raw_items[0][:name].sub!(/\..*$/, '')
          return [raw_items[0]]
        end

        # build name-index of all items
        index = {}
        raw_items.each {|it| index[it[:name]] = it }

        # If item name has no dots, add it directly to items array.
        # Otherwise look up the parent of item and add it as the
        # property of that parent.
        items = []
        raw_items.each do |it|
          if it[:name] =~ /^(.+)\.([^.]+)$/
            it[:name] = $2
            parent = index[$1]
            if parent
              parent[:properties] = [] unless parent[:properties]
              parent[:properties] << it
            else
              warn("#{$1}.#{$2}", pos)
            end
          else
            items << it
          end
        end

        return items
      end

      def warn(name, pos)
        parent = name.sub(/\.[^.]*$/, '')
        msg = "Ignoring subproperty '#{name}' not parent found with name '#{parent}'."
        Logger.warn(:subproperty, msg, pos)
      end

    end

  end
end
