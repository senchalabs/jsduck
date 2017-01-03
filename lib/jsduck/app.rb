require 'jsduck/batch_parser'
require 'jsduck/assets'
require 'jsduck/meta_tag_registry'
require 'jsduck/export_writer'
require 'jsduck/web_writer'
require 'jsduck/logger'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::Options object
    def initialize(opts)
      @opts = opts
    end

    # Main App logic.
    # Returns application exit code.
    def run
      parse

      init_assets

      if @opts.export
        generate_export
      else
        generate_web_page
      end

      if @opts.warnings_exit_nonzero && Logger.warnings_logged?
        return 2
      else
        return 0
      end
    end

    private

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
