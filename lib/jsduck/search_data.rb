
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

        cls[:aliases].each_pair do |key, items|
          items.each do |name|
            list << alias_node(key, name, cls)
          end
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

    # Creates structure representing one alias
    def alias_node(key, name, cls)
      return {
        :cls => alias_display_name(key)+": "+name,
        :member => name,
        :type => :class,
        :icon => cls.icon + "-redirect",
        :url => "#!/api/" + cls.full_name,
        :meta => cls[:meta],
        :sort => 0,
      }
    end

    # Creates structure representing one class
    def class_node(cls)
      return {
        :cls => cls.full_name,
        :member => cls.short_name,
        :type => :class,
        :icon => cls.icon,
        :url => "#!/api/" + cls.full_name,
        :meta => cls[:meta],
        :sort => 1,
      }
    end

    # Creates structure representing one alternate classname
    def alt_node(name, cls)
      return {
        :cls => name,
        :member => Class.short_name(name),
        :type => :class,
        :icon => cls.icon + "-redirect",
        :url => "#!/api/" + cls.full_name,
        :meta => cls[:meta],
        :sort => 2,
      }
    end

    # Creates structure representing one member
    def member_node(member, cls)
      return {
        :cls => cls.full_name,
        :member => member[:name],
        :type => :member,
        :icon => "icon-" + member[:tagname].to_s,
        :url => "#!/api/" + cls.full_name + "-" + member[:id],
        :meta => member[:meta],
        :sort => 3,
      }
    end

    # Some alias types are shown differently.
    # e.g. instead of "widget:" we show "xtype:"
    def alias_display_name(key)
      titles = {
        "widget" => "xtype",
        "plugin" => "ptype",
        "feature" => "ftype",
      }
      titles[key] || key
    end

  end

end
