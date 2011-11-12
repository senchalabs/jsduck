require 'jsduck/class_writer'
require 'jsduck/logger'
require 'jsduck/source_writer'
require 'jsduck/json_duck'
require 'jsduck/icons'
require 'jsduck/search_data'
require 'jsduck/stats'
require 'fileutils'

module JsDuck

  # Performs the standard JSDuck HTML output
  class HtmlExporter
    def initialize(relations, resources, opts)
      @relations = relations
      @resources = resources
      @opts = opts
    end

    def run(&format_classes)
      FileUtils.rm_rf(@opts.output_dir)

      if @opts.template_links
        link_template
      else
        copy_template
      end

      FileUtils.mkdir(@opts.output_dir + "/output")
      FileUtils.mkdir(@opts.output_dir + "/source")

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

      # class-formatting is done in parallel which breaks the links
      # between source files and classes. Therefore it MUST to be done
      # after write_src which needs the links to work.
      write_src
      format_classes.call

      write_app_data

      cw = ClassWriter.new(@relations, @opts)
      cw.write(@opts.output_dir+"/output", ".js")

      @resources[:guides].write(@opts.output_dir+"/guides")
      @resources[:videos].write(@opts.output_dir+"/videos")
      @resources[:examples].write(@opts.output_dir+"/examples")
      @resources[:images].copy(@opts.output_dir+"/images")
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
        "{welcome}" => @resources[:welcome].to_html,
        "{categories}" => @resources[:categories].to_html,
        "{guides}" => @resources[:guides].to_html,
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

    # Writes formatted HTML source code for each input file
    def write_src
      src = SourceWriter.new(@opts.output_dir + "/source", @opts.export ? nil : :page)
      # Can't be done in parallel, because file.html_filename= method
      # updates all the doc-objects related to the file
      @resources[:parsed_files].each do |file|
        html_filename = src.write(file.to_html, file.filename)
        Logger.instance.log("Writing source", html_filename)
        file.html_filename = File.basename(html_filename)
      end
    end

    # Writes classes, guides, videos, and search data to one big .js file
    def write_app_data
      js = "Docs.data = " + JsonDuck.generate({
        :classes => Icons.new.create(@relations.classes),
        :guides => @resources[:guides].to_array,
        :videos => @resources[:videos].to_array,
        :examples => @resources[:examples].to_array,
        :search => SearchData.new.create(@relations.classes),
        :stats => @opts.stats ? Stats.new.create(@relations.classes) : [],
      }) + ";\n"
      File.open(@opts.output_dir+"/data.js", 'w') {|f| f.write(js) }
    end

  end

end
