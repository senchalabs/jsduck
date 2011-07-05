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

    # Copy over doc/params/return from original member to alias.
    def resolve(al)
      orig = find_original(al)
      al[:doc] = al[:doc] + "\n\n" + orig[:doc]
      al[:params] = orig[:params] if orig[:params]
      al[:return] = orig[:return] if orig[:return]
    end

    # Given aliased member, finds the original member.
    # If the original also happens to be an alias, continue recursively.
    def find_original(al)
      al_def = al[:alias]
      
      orig = @relations[al_def[:cls]]
      return al if not orig
      orig = orig.get_member(al_def[:member], al_def[:type] || al[:tagname])
      
      if orig[:alias]
        find_original(orig)
      else
        orig
      end
      
    end
  end

end
