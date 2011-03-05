
module JsDuck

  # Creates list of all members in all classes that is used by the
  # searching feature in UI.
  class Members
    # Given list of class documentation objects returns an array of
    # hashes describing all the members.
    def create(docs)
      list = []
      docs.each do |cls|
        [:cfg, :property, :method, :event].each do |type|
          cls.members(type).each do |m|
            list << member_node(m, cls)
          end
        end
      end
      list
    end

    # Creates structure representing one member
    def member_node(member, cls)
      return {
        :cls => cls.full_name,
        :member => member[:name],
        :type => member[:tagname],
        :doc => short_desc(member[:doc])
      }
    end

    def short_desc(str)
      tagless = first_sentence(strip_tags(strip_links(str)))
      if tagless.length > 120
        short_doc = tagless[0..116]
        ellipsis = tagless.length > short_doc.length ? "..." : ""
        tagless[0..116] + ellipsis
      else
        tagless
      end
    end

    def strip_tags(str)
      str.gsub(/<.*?>/, "")
    end

    def strip_links(str)
      str = str.gsub(/\{@link +(\S*?)(?: +(.+?))?\}/, "\\1")
      str = str.gsub(/#/, ".")
    end

    def first_sentence(str)
      str.sub(/\A(.+?\.)\s.*\Z/m, "\\1")
    end

  end

end
