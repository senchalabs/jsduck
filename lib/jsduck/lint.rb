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
      warn_duplicate_params
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
              warn("Optional param followed by regular param #{p[:name]}", member)
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

    # Loops through all members of all classes
    def each_member(&block)
      @relations.each {|cls| cls.each_member(&block) }
    end

    # Prints warning + filename and linenumber from doc-context
    def warn(msg, member)
      context = member[:files][0]
      Logger.instance.warn(msg, context[:filename], context[:linenr])
    end

  end

end
