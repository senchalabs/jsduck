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
      warn_optional_params
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

    # print warning for each non-optional parameter that follows an optional parameter
    def warn_optional_params
      @relations.each do |cls|
        cls[:members][:method].each do |method|
          optional_found = false
          method[:params].each do |p|
            if optional_found && !p[:optional]
              file = method[:filename]
              line = method[:linenr]
              Logger.instance.warn("Optional param can't be followed by regular param #{p[:name]} in #{file} line #{line}")
            end
            optional_found = optional_found || p[:optional]
          end
        end
      end
    end

  end

end
