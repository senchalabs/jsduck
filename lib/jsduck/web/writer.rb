require 'jsduck/exporter/app'
require 'jsduck/format/batch'
require 'jsduck/class_writer'
require 'jsduck/inline_examples'
require 'jsduck/web/template'
require 'jsduck/web/index_html'
require 'jsduck/web/data'
require 'jsduck/web/css'
require 'jsduck/web/source'
require 'fileutils'

module JsDuck
  module Web

    # Performs the generation of docs web app.
    class Writer
      def initialize(relations, assets, parsed_files, opts)
        @relations = relations
        @assets = assets
        @parsed_files = parsed_files
        @opts = opts
      end

      def write
        write_template_files

        write_html_files

        # class-formatting is done in parallel which breaks the links
        # between source files and classes. Therefore it MUST to be done
        # after writing sources which needs the links to work.
        write_source if @opts.source
        format_classes

        write_inline_examples if @opts.tests

        write_classes

        @assets.write
      end

      # Clean output dir and copy over template files
      def write_template_files
        FileUtils.rm_rf(@opts.output_dir)
        Web::Template.new(@opts).write
      end

      # Generate data.js and styles.css.
      # Then generate HTML files, linking to the data.js and styles.css from them.
      def write_html_files
        # Remember the MD5-fingerprinted filenames
        paths = {
          :data => Web::Data.new(@relations, @assets, @opts).write(@opts.output_dir+"/data.js"),
          :css => Web::Css.new(@opts).write(@opts.output_dir+"/styles.css"),
        }

        Web::IndexHtml.new(@assets, @opts, paths).write
      end

      def write_source
        source_writer = Web::Source.new(@parsed_files)
        source_writer.write(@opts.output_dir + "/source")
      end

      def format_classes
        Format::Batch.format_all!(@relations, @assets, @opts)
      end

      def write_inline_examples
        examples = InlineExamples.new
        examples.add_classes(@relations)
        examples.add_guides(@assets.guides)
        examples.write(@opts.output_dir+"/inline-examples.js")
      end

      def write_classes
        class_writer = ClassWriter.new(Exporter::App, @relations, @opts)
        class_writer.write(@opts.output_dir+"/output", ".js")
      end

    end

  end
end
