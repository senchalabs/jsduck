require 'jsduck/logger'

module JsDuck

  class InheritDoc
    def initialize(relations)
      @relations = relations
    end

    def resolve_all
      @relations.each do |cls|
        cls.each_member do |member|
          if member[:inheritdoc]
            resolve(member)
          end
        end
      end
    end

    # Copy over doc/params/return from original member to new one.
    def resolve(m)
      orig = find_original(m)
      m[:doc] = m[:doc] + "\n\n" + orig[:doc]
      m[:params] = orig[:params] if orig[:params]
      m[:return] = orig[:return] if orig[:return]
    end

    # Finds the member to which inheritdoc refers to.
    # If the original also happens to alos have @inheritdoc, continue recursively.
    def find_original(m)
      context = m[:files][0]
      inherit = m[:inheritdoc]

      orig = @relations[inherit[:cls]]
      unless orig
        Logger.instance.warn(:inheritdoc, "Class #{inherit[:cls]} not found", context[:filename], context[:linenr])
        return m
      end
      orig = orig.get_member(inherit[:member], inherit[:type] || m[:tagname])
      unless orig
        Logger.instance.warn(:inheritdoc, "Member #{inherit[:cls]}##{inherit[:member]} not found", context[:filename], context[:linenr])
        return m
      end

      if orig[:inheritdoc]
        find_original(orig)
      else
        orig
      end
    end

  end

end
