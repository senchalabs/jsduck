require 'jsduck/logger'

module JsDuck

  class Enum
    # Given an enum class, returns the type infered from its values.
    def self.infer_type(cls)
      if cls[:members][:property].length > 0
        types = cls[:members][:property].map {|p| p[:type] }
        cls[:enum][:type] = types.sort.uniq.join("/")
      else
        cls[:enum][:type] = "Object"
        file = cls[:files][0][:filename]
        line = cls[:files][0][:linenr]
        Logger.instance.warn(:enum, "Enum #{cls[:name]} defined without values in it", file, line)
      end
    end
  end

end
