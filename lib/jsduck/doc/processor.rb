require 'jsduck/tag_registry'

module JsDuck
  module Doc

    # Processes @tag data detected from doc-comment, transforming it
    # into a class/member hash which can be then later further merged
    # with code hash.
    #
    # Its main work is done through calling the #process_doc method of
    # all the Tag classes that have registered themselves to process a
    # particular set of @tags through defining a .tagname attribute.
    class Processor
      # Allow passing in filename and line for error reporting
      attr_accessor :filename
      attr_accessor :linenr

      def initialize
        @filename = ""
        @linenr = 0
      end

      # Given tagname and map of tags from DocParser, produces docs
      # of the type determined by tagname.
      def process(tagname, doc_map)
        hash = {
          :tagname => tagname,
          :doc => extract_doc(doc_map),
        }

        position = {:filename => @filename, :linenr => @linenr}

        doc_map.each_pair do |name, value|
          if tag = TagRegistry.get_by_name(name)
            tag.process_doc(hash, value, position)
          end
        end

        return hash
      end

      private

      def extract_doc(doc_map)
        tag = doc_map[:doc] ? doc_map[:doc].first : {}
        return tag[:doc] || ""
      end

    end

  end
end
