
module JsDuck

  # Creates list of all members in all classes that is used by the
  # searching feature in UI.
  class SearchData
    # Given list of classes and other assets, returns an array of
    # hashes describing the search data.
    def create(classes, assets)
      list = []

      classes.each do |cls|
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

      assets.guides.each_item {|g| list << guide_node(g) }

      assets.videos.each_item {|v| list << video_node(v) }

      assets.examples.each_item {|e| list << example_node(e) }

      list
    end

    # Creates structure representing one alias
    def alias_node(key, name, cls)
      return {
        :name => name,
        :fullName => alias_display_name(key)+": "+name,
        :icon => cls.icon + "-redirect",
        :url => "#!/api/" + cls.full_name,
        :meta => cls[:meta],
        :sort => 0,
      }
    end

    # Creates structure representing one class
    def class_node(cls)
      return {
        :name => cls.short_name,
        :fullName => cls.full_name,
        :icon => cls.icon,
        :url => "#!/api/" + cls.full_name,
        :meta => cls[:meta],
        :sort => 1,
      }
    end

    # Creates structure representing one alternate classname
    def alt_node(name, cls)
      return {
        :name => Class.short_name(name),
        :fullName => name,
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
        :name => member[:name],
        :fullName => cls.full_name + "." + member[:name],
        :icon => "icon-" + member[:tagname].to_s,
        :url => "#!/api/" + cls.full_name + "-" + member[:id],
        :meta => member[:meta],
        :sort => 3,
      }
    end

    # Creates structure representing one guide
    def guide_node(guide)
      return {
        :name => guide["title"],
        :fullName => "guide: " + guide["title"],
        :icon => "icon-guide",
        :url => "#!/guide/" + guide["name"],
        :meta => {},
        :sort => 4,
      }
    end

    # Creates structure representing one video
    def video_node(video)
      return {
        :name => video["title"],
        :fullName => "video: " + video["title"],
        :icon => "icon-video",
        :url => "#!/video/" + video["name"],
        :meta => {},
        :sort => 4,
      }
    end

    # Creates structure representing one example
    def example_node(example)
      return {
        :name => example["title"],
        :fullName => "example: " + example["title"],
        :icon => "icon-example",
        :url => "#!/example/" + example["name"],
        :meta => {},
        :sort => 4,
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
