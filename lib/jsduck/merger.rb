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
      code = process_code(docset[:tagname], docset[:code])

      h = {
        :tagname => docset[:tagname],
        :name => docs[:name] || code[:name] || "",
        :autodetected => code[:autodetected] || {},
        :files => [{:filename => filename, :linenr => linenr}],
      }

      general_merge(h, docs, code)
      invoke_merge_in_tags(h, docs, code)
      invoke_merge_in_member_tag(h, docs, code)

      # Needs to be calculated last, as it relies on the existance of
      # :name, :static and :tagname fields.
      h[:id] = JsDuck::Class.member_id(h)

      h
    end

    private

    # Applies processing to extract fields relevant to the member type.
    def process_code(tagname, code)
      TagRegistry.get_by_name(tagname).process_code(code)
    end

    # Invokes the #merge methods of tags registered for the given
    # merge context.
    def invoke_merge_in_tags(h, docs, code)
      TagRegistry.mergers(h[:tagname]).each do |tag|
        tag.merge(h, docs, code)
      end
    end

    # Invokes the #merge method in corresponding member or :class tag.
    def invoke_merge_in_member_tag(h, docs, code)
      TagRegistry.get_by_name(h[:tagname]).merge(h, docs, code)
    end

    # Applies default merge algorithm to the rest of the data.
    def general_merge(h, docs, code)
      # Add all items in docs not already in result.
      docs.each_pair do |key, value|
        h[key] = value unless h[key]
      end

      # Add all items in code not already in result and mark them as
      # auto-detected.  But only if the explicit and auto-detected
      # names don't conflict.
      if Merger.can_be_autodetected?(docs, code)
        code.each_pair do |key, value|
          unless h[key]
            h[key] = value
            mark_autodetected(h, key)
          end
        end
      end
    end

    # True if the name detected from code matches with explicitly
    # documented name.  Also true when no explicit name documented.
    def self.can_be_autodetected?(docs, code)
      docs[:name] == nil || docs[:name] == code[:name]
    end

    # Stores the key as flag into h[:autodetcted]
    def mark_autodetected(h, key)
      h[:autodetected][key] = true
    end

  end

end
