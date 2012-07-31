require 'jsduck/json_duck'
require 'jsduck/null_object'
require 'jsduck/logger'

module JsDuck

  # Reads in JSDuck exports of different versions of docs.
  module Importer
    module_function

    # Loads in exported docs and generates @since and @new tags based on that data.
    def import(imports, relations, parallel)
      if imports.length > 0
        generate_since_tags(read_all(imports, parallel), relations)
      end
    end

    # Reads in data for all versions, returning array of
    # version/class-data pairs.  We don't use a hash to preserve the
    # order of versions (from oldest to newest).
    def read_all(imports, parallel)
      imports.map do |ver|
        {
          :version => ver[:version],
          :classes => ver[:path] ? read(ver, parallel) : current_version,
        }
      end
    end

    def current_version
      NullObject.new(:[] => NullObject.new(:[] => true))
    end

    # Reads in data from all .json files in directory
    def read(ver, parallel)
      # Map list of files into pairs of (classname, members-hash)
      pairs = parallel.map(Dir[ver[:path] + "/*.json"]) do |filename|
        JsDuck::Logger.instance.log("Importing #{ver[:version]}", filename)
        json = JsonDuck.read(filename)
        [json["name"],  members_id_index(json)]
      end

      # Turn key-value pairs array into hash
      return Hash[ pairs ]
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
      last_version = versions.last[:version]

      relations.each do |cls|
        v = cls[:meta][:since] || class_since(versions, cls)
        cls[:meta][:since] = v
        cls[:meta][:new] = true if v == last_version

        cls.all_local_members.each do |m|
          v = m[:meta][:since] || member_since(versions, cls, m)
          m[:meta][:since] = v
          m[:meta][:new] = true if v == last_version
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
