require 'jsduck/util/parallel'
require 'jsduck/class_formatter'
require 'jsduck/doc_formatter'
require 'jsduck/img/dir_set'
require 'jsduck/logger'

module JsDuck

  # Performs the formatting of the doc-object of all classes.
  class BatchFormatter

    # Formats all classes.
    # Also registers found images in assets.
    def self.format_all!(relations, assets, opts)
      # Format all doc-objects in parallel
      formatted_classes = Util::Parallel.map(relations.classes) do |cls|

        files = cls[:files].map {|f| f[:filename] }.join(" ")
        Logger.log("Markdown formatting #{cls[:name]}", files)

        formatter = create_class_formatter(relations, opts)
        begin
          {
            :doc => formatter.format(cls.internal_doc),
            :images => formatter.images.all_used
          }
        rescue
          Logger.fatal_backtrace("Error while formatting #{cls[:name]} #{files}", $!)
          exit(1)
        end
      end

      # Then merge the data back to classes sequentially
      formatted_classes.each do |cls|
        relations[cls[:doc][:name]].internal_doc = cls[:doc]
        # Perform lookup of all the images again.  We're really doing
        # this work twice now, but as we usually don't have excessive
        # amounts of images, the performance penalty should be minimal.
        cls[:images].each {|img| assets.images.get(img[:filename]) }
      end

      # Print warnings for unused images
      assets.images.report_unused
    end

    # Factory method to create new ClassFormatter instances.
    def self.create_class_formatter(relations, opts)
      doc_formatter = DocFormatter.new(relations, opts)
      doc_formatter.images = Img::DirSet.new(opts.images, "images")

      class_formatter = ClassFormatter.new(relations, doc_formatter)
      # Don't format types when exporting
      class_formatter.include_types = !opts.export

      class_formatter
    end

  end

end
