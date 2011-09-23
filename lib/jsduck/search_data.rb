
module JsDuck

  # Creates list of all members in all classes that is used by the
  # searching feature in UI.
  class SearchData
    # Given list of class documentation objects returns an array of
    # hashes describing all the members.
    def create(docs)
      list = []
      docs.each do |cls|
        list << class_node(cls)
        [:members, :statics].each do |group|
          [:cfg, :property, :method, :event].each do |type|
            cls.members(type, group).each do |m|
              # skip inherited items and constructors
              if m[:owner] == cls.full_name && m[:name] != cls.short_name
                list << member_node(m, cls)
              end
            end
          end
        end
      end
      list
    end

    # Creates structure representing one class
    def class_node(cls)
      return {
        :cls => cls.full_name,
        :member => cls.short_name,
        :type => :cls,
        :xtypes => cls[:xtypes]
      }
    end

    # Creates structure representing one member
    def member_node(member, cls)
      return {
        :cls => cls.full_name,
        :member => member[:name],
        :type => member[:tagname],
        :id => member[:id],
      }
    end

  end

end
