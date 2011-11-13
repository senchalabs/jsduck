require 'jsduck/logger'
require 'fileutils'

module JsDuck

  # Deals with creation of main HTML or PHP files.
  class IndexHtml
    attr_accessor :welcome
    attr_accessor :categories
    attr_accessor :guides

    def initialize(opts)
      @opts = opts
    end

    def write
      create_template_html
      create_print_template_html

      if !@opts.seo
        FileUtils.rm(@opts.output_dir+"/index.php")
        FileUtils.cp(@opts.output_dir+"/template.html", @opts.output_dir+"/index.html")
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
