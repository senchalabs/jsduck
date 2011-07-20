require 'jsduck/logger'

module JsDuck

  # Reports bugs and problems in documentation
  class Lint
    attr_accessor :relations

    def initialize(relations)
      @relations = relations
    end

    # Runs the linter
    def run
      warn_globals
      warn_unnamed
    end

    # print warning for each global member
    def warn_globals
      global = @relations["global"]
      return unless global
      global[:members].each_key do |type|
        global.members(type).each do |member|
          name = member[:name]
          file = member[:filename]
          line = member[:linenr]
          Logger.instance.warn("Global #{type}: #{name} in #{file} line #{line}")
        end
      end
    end

    # print warning for each member with no name
    def warn_unnamed
      @relations.each do |cls|
        cls[:members].each_pair do |type, members|
          members.each do |member|
            if !member[:name] || member[:name] == ""
              file = member[:filename]
              line = member[:linenr]
              Logger.instance.warn("Unnamed #{type} in #{file} line #{line}")
            end
          end
        end
      end
    end

  end

end
