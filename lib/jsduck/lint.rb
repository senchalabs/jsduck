require 'jsduck/logger'
require 'jsduck/type_parser'

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
      warn_duplicate_params
      warn_types
    end

    # print warning for each global member
    def warn_globals
      global = @relations["global"]
      return unless global
      global.each_member do |member|
        warn("Global #{member[:tagname]}: #{member[:name]}", member)
      end
    end

    # print warning for each member or parameter with no name
    def warn_unnamed
      each_member do |member|
        if !member[:name] || member[:name] == ""
          warn("Unnamed #{member[:tagname]}", member)
        end
        (member[:params] || []).each do |p|
          if !p[:name] || p[:name] == ""
            warn("Unnamed parameter", member)
          end
        end
      end
    end

    # print warning for each non-optional parameter that follows an optional parameter
    def warn_optional_params
      each_member do |member|
        if member[:tagname] == :method
          optional_found = false
          member[:params].each do |p|
            if optional_found && !p[:optional]
              warn("Optional param can't be followed by regular param #{p[:name]}", member)
            end
            optional_found = optional_found || p[:optional]
          end
        end
      end
    end

    # print warnings for duplicate parameter names
    def warn_duplicate_params
      each_member do |member|
        params = {}
        (member[:params] || []).each do |p|
          if params[p[:name]]
            warn("Duplicate parameter name #{p[:name]}", member)
          end
          params[p[:name]] = true
        end
      end
    end

    # Check parameter types
    def warn_types
      parser = TypeParser.new(@relations)
      each_member do |member|
        (member[:params] || []).each do |p|
          if !parser.parse(p[:type])
            if parser.error == :syntax
              warn("Incorrect parameter type syntax #{p[:type]}", member)
            else
              warn("Unknown parameter type #{p[:type]}", member)
            end
          end
        end

        if member[:return] && !parser.parse(member[:return][:type])
          if parser.error == :syntax
            warn("Incorrect return type syntax #{member[:return][:type]}", member)
          else
            warn("Unknown return type #{member[:return][:type]}", member)
          end
        end

        if member[:type] && !parser.parse(member[:type])
          if parser.error == :syntax
            warn("Incorrect type syntax #{member[:type]}", member)
          else
            warn("Unkown type #{member[:type]}", member)
          end
        end
      end
    end

    # Loops through all members of all classes
    def each_member(&block)
      @relations.each {|cls| cls.each_member(&block) }
    end

    # Prints warning + filename and linenumber from doc-context
    def warn(msg, context)
      Logger.instance.warn(msg + " in #{context[:filename]} line #{context[:linenr]}")
    end

  end

end
