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

          if cls[:doc] == "" && !cls[:private]
            warn(:no_doc, "No documentation for #{cls[:name]}", cls)
          end

          cls.all_local_members.each do |member|
            if !member[:private] && !member[:hide] && !JsDuck::Class.constructor?(member)
              if member[:doc] == ""
                warn(:no_doc_member, "No documentation for #{member[:owner]}##{member[:name]}", member)
              end

              (member[:params] || []).each do |p|
                if p[:doc] == ""
                  warn(:no_doc_param, "No documentation for parameter #{p[:name]} of #{member[:owner]}##{member[:name]}", member)
                end
              end

            end
          end

        end
      end

      private

      # Prints warning + filename and linenumber from doc-context
      def warn(type, msg, member)
        Logger.warn(type, msg, member[:files][0])
      end

    end

  end
end
