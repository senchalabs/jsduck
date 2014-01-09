module JsDuck

  class Override
    def initialize(classes_hash)
      @classes_hash = classes_hash
    end

    # Applies all override classes to target classes
    # Returns all the processed override classes.
    def process_all!
      overrides = []

      @classes_hash.each_value do |cls|
        if cls[:override]
          process(cls)
          overrides << cls
        end
      end

      overrides
    end

    private

    # Applies override class to target class
    def process(override)
      target = @classes_hash[override[:override]]
      unless target
        ctx = override[:files][0]
        return Logger.warn(:extend, "Class #{override[:override]} not found", ctx[:filename], ctx[:linenr])
      end

      # Combine comments of classes
      if override[:doc].length > 0
        add_doc(target, "**From override #{get_name(override)}:** " + override[:doc])
      end
      target[:files] += override[:files]

      # Build lookup table of existing members
      existing = {}
      each_member(target) do |m|
        existing[m[:id]] = m
      end

      # When the same member exists in overridden class, just append
      # the docs.  Otherwise add the member as a whole to the class.
      each_member(override) do |m|
        ex = existing[m[:id]]
        if ex
          if m[:doc].length > 0
            add_doc(ex, "**From override #{get_name(override)}:** " + m[:doc])
          else
            add_doc(ex, "**Overridden in #{get_name(override)}.**")
          end
          ex[:files] += m[:files]
        else
          add_member(target, m)
          add_doc(m, "**Defined in override #{get_name(override)}.**")
          m[:owner] = target[:name]
        end
      end
    end

    # helpers

    def get_name(override)
      if override[:name] != ""
        override[:name]
      else
        override[:files][0][:filename]
      end
    end

    def each_member(cls)
      cls[:members].each {|m| yield m }
    end

    def add_member(cls, m)
      cls[:members] << m
    end

    def add_doc(m, doc)
      m[:doc] = (m[:doc] + "\n\n" + doc).strip
    end
  end

end
