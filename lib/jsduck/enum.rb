require 'jsduck/logger'

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
      cls[:enum][:type] = infer_type(cls) unless cls[:enum][:type]
      expand_default(cls)
      unsure_public(cls)
    end

    # Given an enum class, returns the type infered from its values.
    def infer_type(cls)
      if cls[:members][:property].length > 0
        types = cls[:members][:property].map {|p| p[:type] }
        types.sort.uniq.join("/")
      else
        file = cls[:files][0][:filename]
        line = cls[:files][0][:linenr]
        Logger.instance.warn(:enum, "Enum #{cls[:name]} defined without values in it", file, line)
        "Object"
      end
    end

    # Expands default value like widget.* into list of properties
    def expand_default(cls)
      if cls[:enum][:default] =~ /\A(.*)\.\*\Z/
        gather_aliases($1).each do |name|
          cls[:members][:property] << {
            :tagname => :property,
            :id => 'property-' + name,
            :name => name,
            :default => "'" + name + "'",
            :type => "String",
            :meta => {},
            :files => cls[:files],
            :owner => cls[:name],
            :doc => "",
          }
        end
      end
    end

    def gather_aliases(prefix)
      result = []
      @classes.each_value do |cls|
        if cls[:aliases] && cls[:aliases][prefix]
          result += cls[:aliases][prefix]
        end
      end
      result
    end

    # Ensures that enum values are all public.
    # For this we remove the auto-inserted inheritdoc tag.
    def unsure_public(cls)
      cls[:members][:property].each do |p|
        p[:inheritdoc] = nil if p[:autodetected]
      end
    end
  end

end
