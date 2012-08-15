module JsDuck

  class Enum
    def initialize(classes)
      @classes = classes
    end

    # Applies additional processing to all enum-classes.
    def process_all!
      @classes.each_value do |cls|
        if cls[:enum]
          process(cls)
        end
      end
    end

    private

    # processes single class
    def process(cls)
      expand_default(cls)
      strip_inheritdoc(cls)
      cls[:enum][:type] = infer_type(cls) unless cls[:enum][:type]
    end

    # Given an enum class, returns the type infered from its values.
    def infer_type(cls)
      if cls[:members].length > 0
        types = cls[:members].map {|p| p[:type] }
        types.sort.uniq.join("/")
      else
        "Object"
      end
    end

    # Expands default value like widget.* into list of properties
    def expand_default(cls)
      if cls[:enum][:default] =~ /\A(.*)\.\*\Z/
        each_alias($1) do |name, owner|
          cls[:members] << {
            :tagname => :property,
            :id => 'property-' + name,
            :name => name,
            :default => "'" + name + "'",
            :type => "String",
            :meta => {:private => owner[:private]},
            :private => owner[:private],
            :files => cls[:files],
            :owner => cls[:name],
            :doc => "Alias for {@link #{owner[:name]}}.",
          }
        end
      end
    end

    def each_alias(prefix)
      @classes.each_value do |cls|
        if cls[:aliases] && cls[:aliases][prefix]
          cls[:aliases][prefix].each {|name| yield(name, cls) }
        end
      end
    end

    # Remove the auto-inserted inheritdoc tag so the auto-detected enum
    # values default to being public.
    def strip_inheritdoc(cls)
      cls[:members].each do |p|
        p[:inheritdoc] = nil if p[:autodetected]
      end
    end
  end

end
