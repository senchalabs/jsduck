require 'jsduck/tag_registry'

module JsDuck
  module Doc

    # Detects docs info directly from comment.
    class Ast
      # Allow passing in filename and line for error reporting
      attr_accessor :filename
      attr_accessor :linenr

      def initialize
        @filename = ""
        @linenr = 0
      end

      # Given tagname and map of tags from DocParser, produces docs
      # of the type determined by tagname.
      def detect(tagname, doc_map)
        hash = {
          :tagname => tagname,
          :doc => detect_doc(tagname, doc_map),
        }

        position = {:filename => @filename, :linenr => @linenr}

        doc_map.each_pair do |key, value|
          if tag = TagRegistry.get_by_key(key)
            tag.process_doc(hash, value, position)
          end
        end

        return hash
      end

      private

      # Returns documentation for class or member.
      def detect_doc(tagname, doc_map)
        doc = extract(doc_map, :doc, :doc) || ""
        if tagname == :cfg || tagname == :property
          doc += extract(doc_map, tagname, :doc) || ""
        elsif tagname == :method && doc_map[:constructor]
          doc += extract(doc_map, :constructor, :doc)
        end
        doc
      end

      def extract(doc_map, tagname, propname = nil)
        tag = doc_map[tagname] ? doc_map[tagname].first : nil
        if tag && propname
          tag[propname]
        else
          tag
        end
      end

    end

  end
end
