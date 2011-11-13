require 'jsduck/logger'
require 'jsduck/json_duck'
require 'fileutils'

module JsDuck

  # Copies over the template directory and creates few files inside it.
  class TemplateDir
    attr_accessor :welcome
    attr_accessor :categories
    attr_accessor :guides

    def initialize(relations, opts)
      @relations = relations
      @opts = opts
    end

    def write
      if @opts.template_links
        link_template
      else
        copy_template
      end

      create_template_html
      create_print_template_html

      if !@opts.seo
        FileUtils.rm(@opts.output_dir+"/index.php")
        FileUtils.cp(@opts.output_dir+"/template.html", @opts.output_dir+"/index.html")
      end

      if @opts.eg_iframe
        FileUtils.rm(@opts.output_dir+"/eg-iframe.html")
        FileUtils.cp(@opts.eg_iframe, @opts.output_dir+"/eg-iframe.html")
      end
    end

    def copy_template
      Logger.instance.log("Copying template files to", @opts.output_dir)
      FileUtils.cp_r(@opts.template_dir, @opts.output_dir)
    end

    def link_template
      Logger.instance.log("Linking template files to", @opts.output_dir)
      FileUtils.mkdir(@opts.output_dir)
      Dir.glob(@opts.template_dir + "/*").each do |file|
        File.symlink(File.expand_path(file), @opts.output_dir+"/"+File.basename(file))
      end
    end

    def create_template_html
      write_template("template.html", {
        "{title}" => @opts.title,
        "{header}" => @opts.header,
        "{footer}" => "<div id='footer-content' style='display: none'>#{@opts.footer}</div>",
        "{extjs_path}" => @opts.extjs_path,
        "{local_storage_db}" => @opts.local_storage_db,
        "{show_print_button}" => @opts.seo ? "true" : "false",
        "{touch_examples_ui}" => @opts.touch_examples_ui ? "true" : "false",
        "{welcome}" => @welcome.to_html,
        "{categories}" => @categories.to_html,
        "{guides}" => @guides.to_html,
        "{head_html}" => @opts.head_html,
        "{body_html}" => @opts.body_html,
      })
    end

    def create_print_template_html
      write_template("print-template.html", {
        "{title}" => @opts.title,
        "{header}" => @opts.header,
      })
    end

    # Opens file in template dir, replaces {keys} inside it, writes to output dir
    def write_template(filename, replacements)
      in_file = @opts.template_dir + '/' + filename
      out_file = @opts.output_dir + '/' + filename
      Logger.instance.log("Writing", out_file)
      html = IO.read(in_file)
      html.gsub!(/\{\w+\}/) do |key|
        replacements[key] ? replacements[key] : key
      end
      FileUtils.rm(out_file)
      File.open(out_file, 'w') {|f| f.write(html) }
    end

  end

end
