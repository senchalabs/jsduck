require "jsduck/class"

# A helper for easy creation of classes in tests
#
# Allows simplified members hashes to be used.
module Helper
  class ClassFactory
    def self.create(cfg)
      cfg[:members].each do |m|
        m[:tagname] = :property unless m[:tagname]
        m[:owner] = cfg[:name]
        m[:meta] = {} unless m[:meta]
        m[:meta][:static] = true if m[:static]
        m[:id] = JsDuck::Class.member_id(m)
      end

      JsDuck::Class.new(cfg)
    end
  end
end
