require 'jsduck/img/dir_set'
require 'jsduck/img/writer'
require 'jsduck/welcome'
require 'jsduck/guides'
require 'jsduck/videos'
require 'jsduck/examples'
require 'jsduck/categories'
require 'jsduck/doc_formatter'
require 'jsduck/news'

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
    attr_reader :news

    def initialize(relations, opts)
      @relations = relations
      @opts = opts

      doc_formatter = DocFormatter.new(@relations, @opts)

      @images = Img::DirSet.new(@opts.images, "images")
      @welcome = Welcome.create(@opts.welcome, doc_formatter)
      @guides = Guides.create(@opts.guides, doc_formatter, @opts)
      @videos = Videos.create(@opts.videos)
      @examples = Examples.create(@opts.examples, @opts)
      @categories = Categories.create(@opts.categories_path, doc_formatter, @relations)
      @news = News.create(@relations, doc_formatter, @opts)
    end

    # Writes out the assets that can be written out separately:
    # guides, images.
    #
    # Welcome page and categories are written in JsDuck::IndexHtml
    def write
      @guides.write(@opts.output_dir+"/guides")
      Img::Writer.copy(@images.all_used, @opts.output_dir+"/images")
    end

  end

end
