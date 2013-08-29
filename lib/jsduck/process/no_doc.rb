require 'jsduck/logger'
require 'jsduck/class'

module JsDuck
  module Process

    # Reports missing documentation
    class NoDoc
      def initialize(relations)
        @relations = relations
      end

      # Prints warning for each class or public member with no name
      def process_all!
        @relations.each do |cls|

          if cls[:doc] == ""
            warn(:class, "No documentation for #{cls[:name]}", cls)
          end

          cls.all_local_members.each do |member|
            if !member[:hide] && !JsDuck::Class.constructor?(member)
              if member[:doc] == ""
                warn(:member, "No documentation for #{member[:owner]}##{member[:name]}", member)
              end

              (member[:params] || []).each do |p|
                if p[:doc] == ""
                  warn(:param, "No documentation for parameter #{p[:name]} of #{member[:owner]}##{member[:name]}", member)
                end
              end

            end
          end

        end
      end

      private

      def warn(type, msg, owner)
        visibility = owner[:private] ? :private : (owner[:protected] ? :protected : :public)

        Logger.warn_nodoc(type, visibility, msg, owner[:files][0])
      end

    end

  end
end
