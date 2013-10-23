require 'jsduck/process/importer'

module JsDuck
  module Process

    # Generates @since and @new tags by importing JSDuck exports of
    # older versions of the same project and looking in which version
    # a class or method first appeared.
    class Versions
      def initialize(relations, opts={}, importer=Process::Importer.new)
        @relations = relations
        @opts = opts
        @importer = importer
      end

      # Loads in exported docs and generates @since and @new tags.
      def process_all!
        if @opts[:imports].length > 0
          @versions = @importer.import(@opts[:imports])
          add_since_tags
        end
      end

      private

      # Using the imported versions data, adds @since tags to all
      # classes/members/params.
      def add_since_tags
        @relations.each do |cls|
          v = cls[:since] || class_since(cls)
          cls[:since] = v
          cls[:new] = true if is_new?(v)

          add_members_since_tags(cls)
        end
      end

      def add_members_since_tags(cls)
        cls.all_local_members.each do |m|
          # Remember the initial explicit @since tag value
          # to disable params processing when it's present.
          explicit_since = m[:since]

          v = m[:since] || member_since(cls, m)
          m[:since] = v
          m[:new] = true if is_new?(v)

          add_params_since_tags(cls, m, v) unless explicit_since
        end
      end

      def add_params_since_tags(cls, member, member_version)
        Array(member[:params]).each_with_index do |p, i|
          v = param_since(cls, member, i)
          if v != member_version
            p[:since] = v
            p[:new] = true if is_new?(v)
          end
        end
      end

      # Should items introduced in given version be marked as new?
      def is_new?(version_nr)
        @new_versions = new_versions_map unless @new_versions
        @new_versions[version_nr]
      end

      # Generates a lookup table of versions that we are going to label
      # with @new tags.  By default we use the latest version, otherwise
      # use all versions since the latest.
      def new_versions_map
        new_versions = {}

        if @opts[:new_since]
          @versions.map {|v| v[:version] }.each do |v|
            if v == @opts[:new_since] || !new_versions.empty?
              new_versions[v] = true
            end
          end
        else
          new_versions[@versions.last[:version]] = true
        end

        new_versions
      end

      def param_since(cls, m, i)
        @versions.each do |ver|
          c = ver[:classes][cls[:name]]
          return ver[:version] if c && has_param?(c[m[:id]], i)
          cls[:alternateClassNames].each do |name|
            c = ver[:classes][name]
            return ver[:version] if c && has_param?(c[m[:id]], i)
          end
        end
      end

      # Because parameters can be renamed between versions, only
      # consider parameter count.
      def has_param?(member, param_index)
        member && member.respond_to?(:length) && member.length > param_index
      end

      def member_since(cls, m)
        @versions.each do |ver|
          c = ver[:classes][cls[:name]]
          return ver[:version] if c && c[m[:id]]
          cls[:alternateClassNames].each do |name|
            c = ver[:classes][name]
            return ver[:version] if c && c[m[:id]]
          end
        end
      end

      # Returns name of the version since which the class is available
      def class_since(cls)
        @versions.each do |ver|
          return ver[:version] if ver[:classes][cls[:name]]
          cls[:alternateClassNames].each do |name|
            return ver[:version] if ver[:classes][name]
          end
        end
      end

    end

  end
end
