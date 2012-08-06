module JsDuck

  class Override
    def initialize(classes_hash, classes_array)
      @classes_hash = classes_hash
      @classes_array = classes_array
    end

    # Applies all override classes to target classes
    def process_all!
      overrides = []

      @classes_array.each do |cls|
        if cls[:override]
          process(cls)
          overrides << cls
        end
      end

      # Discard override classes
      overrides.each do |cls|
        @classes_hash.delete(cls[:name])
        @classes_array.delete(cls)
      end
    end

    private

    # Applies override class to target class
    def process(override)
      target = @classes_hash[override[:override]]
      unless target
        ctx = override[:files][0]
        return Logger.instance.warn(:extend, "Class #{override[:override]} not found", ctx[:filename], ctx[:linenr])
      end

      # Combine comments of classes
      if override[:doc].length > 0
        target[:doc] += "\n\n**From override #{override[:name]}:** " + override[:doc]
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
            ex[:doc] += "\n\n**From override #{override[:name]}:** " + m[:doc]
          else
            ex[:doc] += "\n\n**Overridden in #{override[:name]}.**"
          end
          ex[:files] += m[:files]
        else
          add_member(target, m)
          m[:doc] += "\n\n**Defined in override #{override[:name]}.**"
        end
      end
    end

    # helpers

    def each_member(cls)
      [:members, :statics].each do |category|
        cls[category].each_pair do |key, members|
          members.each {|m| yield m }
        end
      end
    end

    def add_member(cls, m)
      cls[m[:static] ? :statics : :members][m[:tagname]] << m
    end
  end

end
