require 'jsduck/json_duck'
require 'jsduck/null_object'

module JsDuck

  # Reads in JSDuck exports of different versions of docs.
  module OldVersions
    module_function

    # Loads in exported docs and generates @since tags based on that data.
    def import(versions, relations)
      generate_since_tags(read_all(versions), relations)
    end

    # Reads in data for all versions, returning array of
    # version/class-data pairs.  We don't use a hash to preserve the
    # order of versions (from oldest to newest).
    def read_all(versions)
      versions.map do |ver|
        {
          :version => ver[:version],
          :classes => ver[:path] ? read(ver[:path]) : current_version,
        }
      end
    end

    def current_version
      NullObject.new(:[] => NullObject.new(:[] => true))
    end

    # Reads in data from all .json files in directory
    def read(path)
      classes = {}
      Dir[path + "/*.json"].each do |filename|
        json = JsonDuck.read(filename)
        classes[json["name"]] = members_id_index(json)
      end
      classes
    end

    # creates index of all class members
    def members_id_index(json)
      index = {}
      ["members", "statics"].each do |group_name|
        json[group_name].each_pair do |tagname, members|
          members.each do |m|
            index[m["id"]] = true
          end
        end
      end
      index
    end

    # Using the imported versions data, adds @since tags to all
    # classes/members.
    def generate_since_tags(versions, relations)
      relations.each do |cls|
        cls[:meta][:since] = class_since(versions, cls)
        cls.all_local_members.each do |m|
          m[:meta][:since] = member_since(versions, cls, m)
        end
      end
    end

    def member_since(versions, cls, m)
      versions.each do |ver|
        c = ver[:classes][cls[:name]]
        return ver[:version] if c && c[m[:id]]
        cls[:alternateClassNames].each do |name|
          c = ver[:classes][name]
          return ver[:version] if c && c[m[:id]]
        end
      end
    end

    # Returns name of the version since which the class is available
    def class_since(versions, cls)
      versions.each do |ver|
        return ver[:version] if ver[:classes][cls[:name]]
        cls[:alternateClassNames].each do |name|
          return ver[:version] if ver[:classes][name]
        end
      end
    end

  end

end
