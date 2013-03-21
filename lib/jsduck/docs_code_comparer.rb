require 'jsduck/util/singleton'

module JsDuck

  # Compares documentation and code hashes.
  # Provides an utility method to help with merging.
  class DocsCodeComparer
    include Util::Singleton

    # Sets the value of a field in result hash based on its value in
    # docs and code hashes.
    #
    # - When docs has the key, gets value from there.
    #
    # - When code has the key and matches with docs, gets value from
    #   there, and also remembers the fact that we're using
    #   auto-detected value by recording it in :autodetected field.
    #
    def merge_if_matches(h, key, docs, code)
      if docs[key]
        h[key] = docs[key]
      elsif code[key] && matches?(docs, code)
        h[key] = code[key]
        mark_autodetected(h, key)
      else
        # nothing
      end
    end

    # True if the name detected from code matches with explicitly
    # documented name.  Also true when no explicit name documented.
    def matches?(docs, code)
      return docs[:name] == nil || docs[:name] == code[:name]
    end

    # Stores the key as flag into h[:autodetcted]
    def mark_autodetected(h, key)
      h[:autodetected] = {} unless h[:autodetected]
      h[:autodetected][key] = true
    end

  end

end
