require 'jsduck/util/parallel'
require 'jsduck/class_formatter'
require 'jsduck/doc_formatter'
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
            :images => formatter.images
          }
        rescue
          Logger.fatal_backtrace("Error while formatting #{cls[:name]} #{files}", $!)
          exit(1)
        end
      end

      # Then merge the data back to classes sequentially
      formatted_classes.each do |cls|
        relations[cls[:doc][:name]].internal_doc = cls[:doc]
        cls[:images].each {|img| assets.images.add(img) }
      end
    end

    # Factory method to create new ClassFormatter instances.
    def self.create_class_formatter(relations, opts)
      doc_formatter = DocFormatter.new(opts)
      doc_formatter.relations = relations
      doc_formatter.img_path = "images"

      class_formatter = ClassFormatter.new(relations, doc_formatter)
      # Don't format types when exporting
      class_formatter.include_types = !opts.export

      class_formatter
    end

  end

end
