
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

        cls[:alternateClassNames].each do |name|
          list << alt_node(name, cls)
        end

        [:members, :statics].each do |group|
          cls[group].each_key do |type|
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
        :type => :class,
        :icon => :class,
        :aliases => cls[:aliases],
        :id => cls.full_name,
      }
    end

    # Creates structure representing one alternate classname
    def alt_node(name, cls)
      return {
        :cls => name,
        :member => Class.short_name(name),
        :type => :class,
        :icon => :subclass,
        :id => cls.full_name,
      }
    end

    # Creates structure representing one member
    def member_node(member, cls)
      return {
        :cls => cls.full_name,
        :member => member[:name],
        :type => :member,
        :icon => member[:tagname],
        :id => cls.full_name + "-" + member[:id],
      }
    end

  end

end
