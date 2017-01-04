require 'jsduck/icons'
require 'jsduck/class_name'

module JsDuck

  # Creates list of all members in all classes that is used by the
  # searching feature in UI.
  class SearchData
    # Given list of classes and other assets, returns an array of
    # hashes describing the search data.
    def create(classes, assets, opts)
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

        # add all local members, but skip hidden members and constructors
        cls[:members].each do |m|
          list << member_node(m, cls) unless m[:meta][:hide] || constructor?(m)
        end
      end

      # Don't include guides data when separate guides search engine is provided
      assets.guides.each_item {|g| list << guide_node(g) } unless opts.search[:url]

      assets.videos.each_item {|v| list << video_node(v) }

      assets.examples.each_item {|e| list << example_node(e) }

      list
    end

    private

    def constructor?(m)
      m[:tagname] == :method && m[:name] == "constructor"
    end

    def alias_node(key, name, cls)
      return {
        :name => name,
        :fullName => alias_display_name(key)+": "+name,
        :icon => Icons::class_icon(cls) + "-redirect",
        :url => "#!/api/" + cls[:name],
        :meta => cls[:meta],
        :sort => 0,
      }
    end

    def class_node(cls)
      return {
        :name => ClassName.short(cls[:name]),
        :fullName => cls[:name],
        :icon => Icons::class_icon(cls),
        :url => "#!/api/" + cls[:name],
        :meta => cls[:meta],
        :sort => 1,
      }
    end

    def alt_node(name, cls)
      return {
        :name => ClassName.short(name),
        :fullName => name,
        :type => :class,
        :icon => Icons::class_icon(cls) + "-redirect",
        :url => "#!/api/" + cls[:name],
        :meta => cls[:meta],
        :sort => 2,
      }
    end

    def member_node(member, cls)
      return {
        :name => member[:name],
        :fullName => cls[:name] + "." + member[:name],
        :icon => "icon-" + member[:tagname].to_s,
        :url => "#!/api/" + cls[:name] + "-" + member[:id],
        :meta => member[:meta],
        :sort => 3,
      }
    end

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
