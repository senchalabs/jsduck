
module JsDuck

  # Calculates all kinds of statistics for classes
  class Stats
    # Maps array of classes into array of stats per class
    def create(classes)
      @classes = classes

      classes.map do |cls|
        local_members = cls.all_local_members
        total_members = cls.all_members
        class_wc = wc(cls[:doc])
        members_wc = members_wc(cls)

        {
          :name => cls[:name],

          :local_cfgs => member_count(local_members, :cfg),
          :local_properties => member_count(local_members, :property),
          :local_methods => member_count(local_members, :method),
          :local_events => member_count(local_members, :event),
          :local_members => local_members.length,

          :total_cfgs => member_count(total_members, :cfg),
          :total_properties => member_count(total_members, :property),
          :total_methods => member_count(total_members, :method),
          :total_events => member_count(total_members, :event),
          :total_members => total_members.length,

          :fanIn => fan_in(cls),
          :fanOut => fan_out(cls),

          :class_wc => class_wc,
          :members_wc => members_wc,
          :wc_per_member => local_members.length > 0 ? (members_wc / local_members.length) : 0,
        }
      end
    end

    def member_count(members, type)
      members.find_all {|m| m[:tagname] == type }.length
    end

    # How many classes depend on this class
    def fan_in(cls)
      fan_in_table[cls[:name]] || 0
    end

    # On how many classes this class depends on
    def fan_out(cls)
      dependencies(cls).length
    end

    # list of class names the class depends on
    def dependencies(cls)
      [
        cls[:extends],
        cls[:mixins],
        cls[:requires],
        cls[:uses],
      ].compact.flatten.sort.uniq
    end

    # Returns map of class names to its fan-in number.
    def fan_in_table
      return @fi_table if @fi_table

      @fi_table = {}
      @classes.each do |cls|
        dependencies(cls).each do |d|
          @fi_table[d] = (@fi_table[d] || 0) + 1
        end
      end
      @fi_table
    end

    # Counts nr of words in documentation of all members of class
    def members_wc(cls)
      cnt = 0
      cls.all_local_members.each do |m|
        cnt += wc(m[:doc])
        (m[:params] || []).each {|p| cnt += property_wc(p) }
        (m[:properties] || []).each {|p| cnt += property_wc(p) }
        cnt += wc(m[:return][:doc]) if m[:return]
      end
      cnt
    end

    def property_wc(property)
      cnt = wc(property[:doc] || "")
      (property[:properties] || []).each {|p| cnt += property_wc(p) }
      cnt
    end

    # Strips HTML and counts words in text
    def wc(str)
      str.gsub(/<\/?[^>]*>/, "").scan(/\w+/).length
    end

  end

end
