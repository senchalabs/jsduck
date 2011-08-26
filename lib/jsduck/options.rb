require 'optparse'

module JsDuck

  # Keeps command line options
  class Options
    attr_accessor :input_files

    attr_accessor :output_dir
    attr_accessor :ignore_global
    attr_accessor :external_classes
    attr_accessor :warnings
    attr_accessor :verbose

    # Customizing output
    attr_accessor :title
    attr_accessor :header
    attr_accessor :footer
    attr_accessor :head_html
    attr_accessor :body_html
    attr_accessor :welcome
    attr_accessor :guides
    attr_accessor :videos
    attr_accessor :examples
    attr_accessor :categories_path
    attr_accessor :inline_examples_dir
    attr_accessor :pretty_json
    attr_accessor :link_tpl
    attr_accessor :img_tpl
    attr_accessor :export
    attr_accessor :seo

    # Debugging
    attr_accessor :processes
    attr_accessor :template_dir
    attr_accessor :template_links
    attr_accessor :extjs_path
    attr_accessor :local_storage_db

    def initialize
      @input_files = []

      @output_dir = nil
      @ignore_global = false
      @external_classes = [
        # JavaScript builtins
        "Object",
        "String",
        "Number",
        "Boolean",
        "RegExp",
        "Function",
        "Array",
        "Arguments",
        "Date",
        "Error",
        # DOM
        "HTMLElement",
        "XMLElement",
        "NodeList",
        "TextNode",
        "CSSStyleSheet",
        "CSSStyleRule",
        "Event",
      ]

      @warnings = true
      @verbose = false

      # Customizing output
      @title = "Sencha Docs - Ext JS"
      @header = "<strong>Sencha Docs</strong> Ext JS"
      @footer = 'Generated with <a href="https://github.com/senchalabs/jsduck">JSDuck</a>.'
      @head_html = ""
      @body_html = ""
      @welcome = nil
      @guides = nil
      @videos = nil
      @examples = nil
      @categories_path = nil
      @inline_examples_dir = nil
      @pretty_json = false
      @link_tpl = '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'
      # Note that we wrap image template inside <p> because {@img} often
      # appears inline within text, but that just looks ugly in HTML
      @img_tpl = '<p><img src="doc-resources/%u" alt="%a"></p>'
      @export = nil
      @seo = false

      # Debugging
      @processes = nil
      @template_dir = File.dirname(File.dirname(File.dirname(__FILE__))) + "/template"
      @template_links = false
      @extjs_path = "extjs/ext-all.js"
      @local_storage_db = "docs"
    end

    def parse!(argv)
      create_option_parser.parse!(argv).each {|fname| read_filenames(fname) }
      validate
    end

    def create_option_parser
      return OptionParser.new do | opts |
        opts.banner = "Usage: jsduck [options] files/dirs...\n\n"

        opts.on('-o', '--output=PATH',
          "Directory to output all this amazing documentation.",
          "This option MUST be specified.", " ") do |path|
          @output_dir = path
        end

        opts.on('--ignore-global', "Turns off the creation of global class.", " ") do
          @ignore_global = true
        end

        opts.on('--external=Foo,Bar,Baz', Array,
          "Declares list of external classes.  These classes",
          "will then not generate warnings when used in type",
          "definitions or inherited from.", " ") do |classes|
          @external_classes += classes
        end

        opts.on('--no-warnings', "Turns off warnings.", " ") do
          @warnings = false
        end

        opts.on('-v', '--verbose', "This will fill up your console.", " ") do
          @verbose = true
        end

        opts.separator "Customizing output:"
        opts.separator ""

        opts.on('--title=TEXT',
          "Custom title text for the documentation.",
          "Defaults to 'Sencha Docs - Ext JS'", " ") do |text|
          @title = text
          @header = text.sub(/^(.*?) +- +/, "<strong>\\1 </strong>")
        end

        opts.on('--footer=TEXT',
          "Custom footer text for the documentation.",
          "Defaults to: 'Generated with JSDuck.'", " ") do |text|
          @footer = text
        end

        opts.on('--head-html=HTML', "HTML to append to the <head> section of index.html.", " ") do |html|
          @head_html = html
        end

        opts.on('--body-html=HTML', "HTML to append to the <body> section index.html.", " ") do |html|
          @body_html = html
        end

        opts.on('--welcome=PATH',
          "Path to HTML file with content for welcome page.", " ") do |path|
          @welcome = path
        end

        opts.on('--guides=PATH',
          "Path to JSON file describing the guides. The file",
          "should be in a dir containing the actual guides.",
          "A guide is a dir containing README.md, icon.png,",
          "and other images referenced by the README.md file.", " ") do |path|
          @guides = path
        end

        opts.on('--videos=PATH',
          "Path to JSON file describing the videos.", " ") do |path|
          @videos = path
        end

        opts.on('--examples=PATH',
          "Path JSON file describing the examples.", " ") do |path|
          @examples = path
        end

        opts.on('--categories=PATH',
          "Path to JSON file which defines categories for classes.", " ") do |path|
          @categories_path = path
        end

        opts.on('--inline-examples=PATH', "Path to inline examples directory.", " ") do |path|
          @inline_examples_dir = path
        end

        opts.on('--pretty-json', "Turn on pretty-printing of JSON.", " ") do
          @pretty_json = true
        end

        opts.on('--link=TPL',
          "HTML template for replacing {@link}.",
          "Possible placeholders:",
          "%c - full class name (e.g. 'Ext.Panel')",
          "%m - class member name prefixed with member type",
          "     (e.g. 'method-urlEncode')",
          "%# - inserts '#' if member name present",
          "%- - inserts '-' if member name present",
          "%a - anchor text for link",
          "Default is: '<a href=\"#!/api/%c%-%m\" rel=\"%c%-%m\" class=\"docClass\">%a</a>'", " ") do |tpl|
          @link_tpl = tpl
        end

        opts.on('--img=TPL',
          "HTML template for replacing {@img}.",
          "Possible placeholders:",
          "%u - URL from @img tag (e.g. 'some/path.png')",
          "%a - alt text for image",
          "Default is: '<p><img src=\"doc-resources/%u\" alt=\"%a\"></p>'", " ") do |tpl|
          @img_tpl = tpl
        end

        opts.on('--json', "Produces JSON export instead of HTML documentation.", " ") do
          @export = :json
        end

        opts.on('--stdout', "Writes JSON export to STDOUT instead of writing to the filesystem", " ") do
          @export = :stdout
        end

        opts.on('--seo', "Creates index.php that handles search engine traffic.", " ") do
          @seo = true
        end

        opts.separator "Debugging:"
        opts.separator ""

        # For debugging it's often useful to set --processes=0 to get deterministic results.
        opts.on('-p', '--processes=COUNT',
          "The number of parallel processes to use.",
          "Defaults to the number of processors/cores.",
          "Set to 0 to disable parallel processing completely.", " ") do |count|
          @processes = count.to_i
        end

        opts.on('--template=PATH',
          "Directory containing doc-browser UI template.", " ") do |path|
          @template_dir = path
        end

        opts.on('--template-links',
          "Instead of copying template files, create symbolic",
          "links.  Useful for template files development.",
          "Only works on platforms supporting symbolic links.", " ") do
          @template_links = true
        end

        opts.on('--extjs-path=PATH',
          "Path for main ExtJS JavaScript file.  Useful for specifying",
          "something different than extjs/ext.js", " ") do |path|
          @extjs_path = path
        end

        opts.on('--local-storage-db=NAME',
          "Prefix for LocalStorage database names.",
          "Defaults to 'docs'.", " ") do |name|
          @local_storage_db = name
        end

        opts.on('-h', '--help', "Prints this help message", " ") do
          puts opts
          exit
        end
      end
    end

    # scans directory for .js files or simply adds file to input files list
    def read_filenames(fname)
      if File.exists?(fname)
        if File.directory?(fname)
          Dir[fname+"/**/*.{js,css,scss}"].each {|f| @input_files << f }
        else
          @input_files << fname
        end
      else
        $stderr.puts "Warning: File #{fname} not found"
      end
    end

    # Runs checks on the options
    def validate
      if @input_files.length == 0
        puts "You should specify some input files, otherwise there's nothing I can do :("
        exit(1)
      elsif @export != :stdout
        if !@output_dir
          puts "You should also specify an output directory, where I could write all this amazing documentation."
          exit(1)
        elsif File.exists?(@output_dir) && !File.directory?(@output_dir)
          puts "Oh noes!  The output directory is not really a directory at all :("
          exit(1)
        elsif !File.exists?(File.dirname(@output_dir))
          puts "Oh noes!  The parent directory for #{@output_dir} doesn't exist."
          exit(1)
        elsif !File.exists?(@template_dir + "/extjs")
          puts "Oh noes!  The template directory does not contain extjs/ directory :("
          puts "Please copy ExtJS over to template/extjs or create symlink."
          puts "For example:"
          puts "    $ cp -r /path/to/ext-4.0.0 " + @template_dir + "/extjs"
          exit(1)
        elsif !File.exists?(@template_dir + "/resources/css")
          puts "Oh noes!  CSS files for custom ExtJS theme missing :("
          puts "Please compile SASS files in template/resources/sass with compass."
          puts "For example:"
          puts "    $ compass compile " + @template_dir + "/resources/sass"
          exit(1)
        end
      end
    end

  end

end
