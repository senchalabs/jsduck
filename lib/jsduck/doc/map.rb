module JsDuck
  module Doc

    # Helper for building at-tags lookup table.
    class Map

      # Builds map of at-tags for quick lookup
      def self.build(docs)
        map = {}
        docs.each do |tag|
          if map[tag[:tagname]]
            map[tag[:tagname]] << tag
          else
            map[tag[:tagname]] = [tag]
          end
        end
        map
      end

    end

  end
end
