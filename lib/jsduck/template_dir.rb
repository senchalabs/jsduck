require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Copies over the template directory.
  #
  # Or links when --template-links option specified.
  class TemplateDir
    def initialize(opts)
      @opts = opts
      @files = [
        "app",
        "app*.js",
        "favicon.ico",
        "extjs",
        "resources",
      ]
    end

    def write
      FileUtils.mkdir(@opts.output_dir)
      if @opts.template_links
        Logger.log("Linking template files to", @opts.output_dir)
        move_files(:symlink)
      else
        Logger.log("Copying template files to", @opts.output_dir)
        move_files(:cp_r)
      end

      # always copy the eg-iframe file.
      eg_iframe = @opts.eg_iframe || @opts.template_dir+"/eg-iframe.html"
      FileUtils.cp(eg_iframe, @opts.output_dir+"/eg-iframe.html")
    end

    private

    # moves files from one dir to another using a method of FileUtils module.
    def move_files(method)
      @files.each do |file|
        target = File.expand_path(@opts.output_dir)
        Dir.glob(File.expand_path(@opts.template_dir+"/"+file)).each do |source|
          FileUtils.send(method, source, target)
        end
      end
    end

  end

end
