require 'jsduck/images'
require 'jsduck/welcome'
require 'jsduck/guides'
require 'jsduck/videos'
require 'jsduck/examples'
require 'jsduck/categories'
require 'jsduck/doc_formatter'

module JsDuck

  # Binds together: Welcome page, Categories, Images, Guides, Videos,
  # Examples.
  #
  # Often we need to pass guides/videos/examples/... to several
  # classes. Having all these assets together in here, means we just
  # need to pass one value instead of 3 or more.
  class Assets
    attr_reader :images
    attr_reader :welcome
    attr_reader :guides
    attr_reader :videos
    attr_reader :examples
    attr_reader :categories

    def initialize(relations, opts)
      @relations = relations
      @opts = opts

      @images = Images.new(@opts.images)
      @welcome = Welcome.create(@opts.welcome)
      @guides = Guides.create(@opts.guides, DocFormatter.new(@relations, @opts), @opts)
      @videos = Videos.create(@opts.videos)
      @examples = Examples.create(@opts.examples, @opts)
      @categories = Categories.create(@opts.categories_path, DocFormatter.new(@relations, @opts), @relations)
    end

    # Writes out the assets that can be written out separately:
    # guides, videos, examples, images.
    #
    # Welcome page and categories are written in JsDuck::IndexHtml
    def write
      @guides.write(@opts.output_dir+"/guides")
      @videos.write(@opts.output_dir+"/videos")
      @examples.write(@opts.output_dir+"/examples")
      @images.copy(@opts.output_dir+"/images")
    end

  end

end
