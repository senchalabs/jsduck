require 'jsduck/logger'
require 'jsduck/util/io'
require 'fileutils'

module JsDuck

  # Deals with creation of main HTML or PHP files.
  class IndexHtml
    def initialize(assets, opts)
      @assets = assets
      @opts = opts
    end

    # In normal mode creates index.html.
    #
    # When --seo enabled, creates index.php, template.html and print-template.html.
    def write
      if @opts.seo
        FileUtils.cp(@opts.template_dir+"/index.php", @opts.output_dir+"/index.php")
        create_template_html(@opts.template_dir+"/template.html", @opts.output_dir+"/template.html")
        create_print_template_html(@opts.template_dir+"/print-template.html", @opts.output_dir+"/print-template.html")
        create_index_template_html(@opts.template_dir+"/index-template.html", @opts.output_dir+"/index-template.html")
      else
        create_template_html(@opts.template_dir+"/template.html", @opts.output_dir+"/index.html")
      end
    end

    private

    def create_template_html(in_file, out_file)
      write_template(in_file, out_file, {
        "{title}" => @opts.title,
        "{mobile_redirect}" => @opts.seo ? include_script(@opts.template_dir+"/mobile-redirect.js") : "",
        "{header}" => @opts.header,
        "{footer}" => "<div id='footer-content' style='display: none'>#{@opts.footer}</div>",
        "{extjs_path}" => @opts.extjs_path,
        "{data_path}" => File.basename(@opts.data_path),
        "{welcome}" => @assets.welcome.to_html("display:none"),
        "{categories}" => @assets.categories.to_html("display:none"),
        "{news}" => @assets.news.to_html("display:none"),
        "{guides}" => @assets.guides.to_html("display:none"),
        "{head_html}" => @opts.head_html,
        "{body_html}" => @opts.body_html,
      })
    end

    def create_print_template_html(in_file, out_file)
      write_template(in_file, out_file, {
        "{title}" => @opts.title,
        "{header}" => @opts.header,
      })
    end

    def create_index_template_html(in_file, out_file)
      categories = @assets.categories.to_html
      guides = @assets.guides.to_html

      write_template(in_file, out_file, {
        "{title}" => @opts.title,
        "{header}" => @opts.header,
        "{categories}" => categories ? "<h1>API Documentation</h1> #{categories}" : "",
        "{guides}" => guides ? "<h1>Guides</h1> #{guides}" : "",
      })
    end

    def include_script(filename)
      "<script type='text/javascript'>\n" + Util::IO.read(filename) + "\n</script>"
    end

    # Opens in_file, replaces {keys} inside it, writes to out_file
    def write_template(in_file, out_file, replacements)
      Logger.log("Writing", out_file)
      html = Util::IO.read(in_file)
      html.gsub!(/\{\w+\}/) do |key|
        replacements[key] ? replacements[key] : key
      end
      File.open(out_file, 'w') {|f| f.write(html) }
    end

  end

end
