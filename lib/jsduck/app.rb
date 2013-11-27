require 'jsduck/batch_parser'
require 'jsduck/batch_processor'
require 'jsduck/assets'
require 'jsduck/tag_registry'
require 'jsduck/export_writer'
require 'jsduck/web/writer'
require 'jsduck/logger'

module JsDuck

  # The main application logic of jsduck
  class App
    # Initializes app with JsDuck::OptionsRecord object
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
      @parsed_files = BatchParser.parse(@opts)
      @relations = BatchProcessor.process(@parsed_files, @opts)
    end

    def init_assets
      # Initialize guides, videos, examples, ...
      @assets = Assets.new(@relations, @opts)

      # HACK: Give access to assets from @aside tag
      TagRegistry.get_by_name(:aside).assets = @assets
    end

    def generate_export
      ExportWriter.new(@relations, @assets, @opts).write
    end

    def generate_web_page
      Web::Writer.new(@relations, @assets, @parsed_files, @opts).write
    end

  end

end
