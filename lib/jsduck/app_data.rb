require 'jsduck/util/json'
require 'jsduck/icons'
require 'jsduck/search_data'
require 'jsduck/meta_tag_registry'

module JsDuck

  # Creates big JS file with data for Docs app.
  class AppData
    def initialize(relations, assets, opts)
      @relations = relations
      @assets = assets
      @opts = opts
    end

    # Writes classes, guides, videos, and search data to one big .js file
    def write(filename)
      js = "Docs = " + Util::Json.generate({
        :data => {
          :classes => Icons.new.create(@relations.classes),
          :guides => @assets.guides.to_array,
          :videos => @assets.videos.to_array,
          :examples => @assets.examples.to_array,
          :search => SearchData.new.create(@relations.classes, @assets),
          :tests => @opts.tests,
          :signatures => MetaTagRegistry.instance.signatures,
          :localStorageDb => @opts.local_storage_db,
          :showPrintButton => @opts.seo,
          :touchExamplesUi => @opts.touch_examples_ui,
          :source => @opts.source,
          :commentsUrl => @opts.comments_url,
          :commentsDomain => @opts.comments_domain,
        }
      }) + ";\n"
      File.open(filename, 'w') {|f| f.write(js) }
    end

  end

end
