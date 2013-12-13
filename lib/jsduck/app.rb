require 'jsduck/batch_parser'
require 'jsduck/assets'
require 'jsduck/meta_tag_registry'
require 'jsduck/export_writer'
require 'jsduck/web_writer'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
    end

    # Main App logic.
    def run
=begin
    if @opts.rest
      rest_docs = parallel_parse_rest(@opts.input_files)
      rest_objs = aggregate(rest_docs)
      @relations = filter_classes(rest_objs)
    else
      parsed_files = parallel_parse(@opts.input_files)
      result = aggregate(parsed_files)
      @relations = filter_classes(result)
      InheritDoc.new(@relations).resolve_all
      Importer.import(@opts.imports, @relations, @opts.new_since)
      Lint.new(@relations).run
    end
=end
      parse

      init_assets

      if @opts.export
        generate_export
      else
        generate_web_page
      end
    end

    private

=begin
    def parallel_parse_rest(filenames)
      ParallelWrap.map(filenames) do |fname|
        Logger.instance.log("Parsing", fname)
        begin
          RestFile.new(JsDuck::IO.read(fname), fname, @opts)
        rescue
          Logger.instance.fatal("Error while parsing #{fname}", $!)
          exit(1)
        end
      end
    end
    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        Logger.instance.log("Aggregating", file.filename)
        agr.aggregate(file)
      end
      agr.classify_orphans
      if ! @opts.rest
        agr.create_global_class
        agr.remove_ignored_classes
        agr.create_accessors
      end
      if @opts.ext4_events == true || (@opts.ext4_events == nil && agr.ext4?)
        agr.append_ext4_event_options
      end
      agr.process_enums
      # Ignore override classes after applying them to actual classes
      @opts.external_classes += agr.process_overrides.map {|o| o[:name] }
      agr.result
=end
    def parse
      @batch_parser = BatchParser.new(@opts)
      @relations = @batch_parser.run
    end

    def init_assets
      # Initialize guides, videos, examples, ...
      @assets = Assets.new(@relations, @opts)

      # Give access to assets from all meta-tags
      MetaTagRegistry.instance.assets = @assets
    end

    def generate_export
      ExportWriter.new(@relations, @assets, @opts).write
    end

    def generate_web_page
      WebWriter.new(@relations, @assets, @batch_parser.parsed_files, @opts).write
    end

  end

end
