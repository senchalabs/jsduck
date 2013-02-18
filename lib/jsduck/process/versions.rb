require 'jsduck/process/importer'
require 'jsduck/tag_registry'

module JsDuck
  module Process

    # Generates @since and @new tags by importing JSDuck exports of
    # older versions of the same project and looking in which version
    # a class or method first appeared.
    #
    # Additionally here the tooltip text for @new tag gets injected.
    class Versions
      def initialize(relations, opts={}, importer=nil)
        @relations = relations
        @opts = opts
        # Allow different importer to be injected for testing
        @importer = importer || Process::Importer.new
      end

      # Loads in exported docs and generates @since and @new tags.
      def process_all!
        init_new_tag_tooltip!

        if @opts[:imports].length > 0
          generate_since_tags(@importer.import(@opts[:imports]))
        end
      end

      private

      # Initializes the tooltip text for the signature of @new tag.
      def init_new_tag_tooltip!
        signature = TagRegistry.get_by_name(:new).signature
        if @opts[:new_since]
          signature[:tooltip] = "New since #{@opts[:new_since]}"
        elsif @opts[:imports].length > 0
          signature[:tooltip] = "New since #{@opts[:imports].last[:version]}"
        end
      end

      # Using the imported versions data, adds @since tags to all
      # classes/members.
      def generate_since_tags(versions)
        new_versions = build_new_versions_map(versions)

        @relations.each do |cls|
          v = cls[:since] || class_since(versions, cls)
          cls[:since] = v
          cls[:new] = true if new_versions[v]

          cls.all_local_members.each do |m|
            v = m[:since] || member_since(versions, cls, m)
            m[:since] = v
            m[:new] = true if new_versions[v]
          end
        end
      end

      # Generates a lookup table of versions that we are going to label
      # with @new tags.  By default we use the latest version, otherwise
      # use all versions since the latest.
      def build_new_versions_map(versions)
        new_versions = {}

        if @opts[:new_since]
          versions.map {|v| v[:version] }.each do |v|
            if v == @opts[:new_since] || !new_versions.empty?
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
end
