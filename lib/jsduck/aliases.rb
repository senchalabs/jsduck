module JsDuck

  class Aliases
    def initialize(relations)
      @relations = relations
    end

    def resolve_all
      @relations.each do |cls|
        cls.each_member do |member|
          if member[:alias]
            resolve(member)
          end
        end
      end
    end

    # Copy over doc/params/return from original methods to aliases.
    def resolve(al)
      al_def = al[:alias]
      orig = @relations[al_def[:cls]].get_member(al_def[:member], al_def[:type] || al[:tagname])
      al[:doc] = al[:doc] + "\n\n" + orig[:doc]
      al[:params] = orig[:params] if orig[:params]
      al[:return] = orig[:return] if orig[:return]
    end
  end

end
