require 'jsduck/class'
require 'jsduck/tag_registry'

module JsDuck

  # Takes data from comment and code that follows it and combines
  # these two pieces of information into one.  The code comes from
  # JsDuck::JS::Ast and comment from JsDuck::Doc::Processor.
  #
  # The main method merge() produces a hash as a result.
  class Merger

    # Takes a docset and merges the :comment and :code inside it,
    # producing hash as a result.
    def merge(docset, filename="", linenr=0)
      docs = docset[:comment]
      code = docset[:code]

      h = {
        :tagname => docset[:tagname],
        :files => [{:filename => filename, :linenr => linenr}],
      }

      invoke_merge_in_tags(h, docs, code)
      general_merge(h, docs, code)

      # Needs to be calculated last, as it relies on the existance of
      # :name, :static and :tagname fields.
      h[:id] = JsDuck::Class.member_id(h)

      h
    end

    private

    # Invokes the #merge methods of tags registered for the given
    # merge context.
    def invoke_merge_in_tags(h, docs, code)
      TagRegistry.mergers(h[:tagname]).each do |tag|
        tag.merge(h, docs, code)
      end
    end

    # Applies default merge algorithm to the rest of the data.
    def general_merge(h, docs, code)
      # Merge in all items in docs that don't occour already in result.
      docs.each_pair do |key, value|
        h[key] = value unless h.has_key?(key)
      end
      # Then add all in the items from code not already in result.
      code.each_pair do |key, value|
        h[key] = value unless h.has_key?(key)
      end
    end

  end

end
