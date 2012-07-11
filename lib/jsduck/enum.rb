require 'jsduck/logger'

module JsDuck

  class Enum
    # Applies additional processing to enum-class.
    def self.process(cls)
      cls[:enum][:type] = self.infer_type(cls) unless cls[:enum][:type]
      self.unsure_public(cls)
    end

    private

    # Given an enum class, returns the type infered from its values.
    def self.infer_type(cls)
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

    # Ensures that enum values are all public.
    # For this we remove the auto-inserted inheritdoc tag.
    def self.unsure_public(cls)
      cls[:members][:property].each do |p|
        p[:inheritdoc] = nil if p[:autodetected]
      end
    end
  end

end
