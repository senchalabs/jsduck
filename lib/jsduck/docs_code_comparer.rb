require 'jsduck/util/singleton'

module JsDuck

  # Compares documentation and code hashes.
  # Provides an utility method to help with merging.
  class DocsCodeComparer
    include Util::Singleton

    # When docs has the key, returns value from there.
    # When code has the key and matches with docs, gets value from there.
    # Otherwise returns nil.
    def merge_if_matches(key, docs, code)
      if docs[key]
        docs[key]
      elsif code[key] && matches?(docs, code)
        code[key]
      else
        nil
      end
    end

    # True if the name detected from code matches with explicitly
    # documented name.  Also true when no explicit name documented.
    def matches?(docs, code)
      return docs[:name] == nil || docs[:name] == code[:name]
    end

  end

end
