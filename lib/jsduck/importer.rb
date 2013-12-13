require 'jsduck/util/json'
require 'jsduck/util/null_object'
require 'jsduck/logger'
require 'jsduck/util/parallel'

module JsDuck

  # Reads in JSDuck exports of different versions of docs.
  module Importer
    module_function

    # Loads in exported docs and generates @since and @new tags based on that data.
    def import(imports, relations, new_since=nil)
      if imports.length > 0
        generate_since_tags(read_all(imports), relations, new_since)
      end
    end

    # Reads in data for all versions, returning array of
    # version/class-data pairs.  We don't use a hash to preserve the
    # order of versions (from oldest to newest).
    def read_all(imports)
      imports.map do |ver|
        {
          :version => ver[:version],
          :classes => ver[:path] ? read(ver) : current_version,
        }
      end
    end

    def current_version
      Util::NullObject.new(:[] => Util::NullObject.new(:[] => true))
    end

    # Reads in data from all .json files in directory
    def read(ver)
      # Map list of files into pairs of (classname, members-hash)
      pairs = Util::Parallel.map(Dir[ver[:path] + "/*.json"]) do |filename|
        JsDuck::Logger.log("Importing #{ver[:version]}", filename)
        json = Util::Json.read(filename)
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
    def generate_since_tags(versions, relations, new_since=nil)
      new_versions = build_new_versions_map(versions, new_since)

      relations.each do |cls|
        v = cls[:meta][:since] || class_since(versions, cls)
        cls[:meta][:since] = v
        cls[:meta][:new] = true if new_versions[v]

        cls.all_local_members.each do |m|
          v = m[:meta][:since] || member_since(versions, cls, m)
          m[:meta][:since] = v
          m[:meta][:new] = true if new_versions[v]
        end
      end
    end

    # Generates a lookup table of versions that we are going to label
    # with @new tags.  By default we use the latest version, otherwise
    # use all versions since the latest.
    def build_new_versions_map(versions, new_since=nil)
      new_versions = {}

      if new_since
        versions.map {|v| v[:version] }.each do |v|
          if v == new_since || !new_versions.empty?
            new_versions[v] = true
          end
        end
      else
        new_versions[versions.last[:version]] = true
      end

      new_versions
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
