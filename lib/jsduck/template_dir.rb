require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Copies over the template directory.
  #
  # Or links when --template-links option specified.
  class TemplateDir
    def initialize(opts)
      @opts = opts
    end

    def write
      if @opts.template_links
        link_files
      else
        copy_files
      end

      if @opts.eg_iframe
        FileUtils.rm(@opts.output_dir+"/eg-iframe.html")
        FileUtils.cp(@opts.eg_iframe, @opts.output_dir+"/eg-iframe.html")
      end
    end

    def copy_files
      Logger.instance.log("Copying template files to", @opts.output_dir)
      FileUtils.cp_r(@opts.template_dir, @opts.output_dir)
    end

    def link_files
      Logger.instance.log("Linking template files to", @opts.output_dir)
      FileUtils.mkdir(@opts.output_dir)
      Dir.glob(@opts.template_dir + "/*").each do |file|
        File.symlink(File.expand_path(file), @opts.output_dir+"/"+File.basename(file))
      end
    end

  end

end
