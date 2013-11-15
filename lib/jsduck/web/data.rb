require 'jsduck/util/json'
require 'jsduck/util/md5'
require 'jsduck/web/tree'
require 'jsduck/web/search'
require 'jsduck/tag_registry'

module JsDuck
  module Web

    # Creates big JS file with data for Docs app.
    class Data
      def initialize(relations, assets, opts)
        @relations = relations
        @assets = assets
        @opts = opts
      end

      # Writes classes, guides, videos, and search data to one big .js file.
      # Then Renames the file so it contains an MD5 hash inside it,
      # returning the resulting fingerprinted name.
      def write(filename)
        js = "Docs = " + Util::Json.generate({
          :data => {
            :classes => Web::Tree.create(@relations.classes),
            :guides => @assets.guides.to_array,
            :videos => @assets.videos.to_array,
            :examples => @assets.examples.to_array,
            :search => Web::Search.new.create(@relations.classes, @assets, @opts),
            :guideSearch => @opts.search,
            :tests => @opts.tests,
            :signatures => TagRegistry.signatures,
            :memberTypes => TagRegistry.member_types,
            :localStorageDb => @opts.local_storage_db,
            :showPrintButton => @opts.seo,
            :touchExamplesUi => @opts.touch_examples_ui,
            :source => @opts.source,
            :commentsUrl => @opts.comments_url,
            :commentsDomain => @opts.comments_domain,
            :message => @opts.message,
          }
        }) + ";\n"

        File.open(filename, 'w') {|f| f.write(js) }

        Util::MD5.rename(filename)
      end

    end

  end
end
