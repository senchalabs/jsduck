require 'optparse'
require 'jsduck/meta_tag'
require 'jsduck/author_tag'
require 'jsduck/doc_author_tag'

module JsDuck

  # Keeps command line options
  class Options
    attr_accessor :input_files

    attr_accessor :output_dir
    attr_accessor :ignore_global
    attr_accessor :external_classes
    attr_accessor :meta_tags
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
    attr_accessor :pretty_json
    attr_accessor :images
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
    attr_accessor :touch_examples_ui
    attr_accessor :ext_namespaces

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
        # Special anything-goes type
        "Mixed",
      ]
      @meta_tags = []
      @meta_tag_paths = []

      @warnings = true
      @verbose = false
      @version = "3.0.pre2"

      # Customizing output
      @title = "Sencha Docs - Ext JS"
      @header = "<strong>Sencha Docs</strong> Ext JS"
      @footer = "Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> #{@version}."
      @head_html = ""
      @body_html = ""
      @welcome = nil
      @guides = nil
      @videos = nil
      @examples = nil
      @categories_path = nil
      @pretty_json = false
      @images = []
      @link_tpl = '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'
      # Note that we wrap image template inside <p> because {@img} often
      # appears inline within text, but that just looks ugly in HTML
      @img_tpl = '<p><img src="%u" alt="%a"></p>'
      @export = nil
      @seo = false

      # Debugging
      @processes = nil
      @root_dir = File.dirname(File.dirname(File.dirname(__FILE__)))
      @template_dir = @root_dir + "/template-min"
      @template_links = false
      @extjs_path = "extjs/ext-all.js"
      @local_storage_db = "docs"
      @touch_examples_ui = false
      @ext_namespaces = ["Ext"]
    end

    # Make options object behave like hash.
    # This allows us to substitute it with hash in unit tests.
    def [](key)
      send(key)
    end

    def parse!(argv)
      create_option_parser.parse!(argv).each {|fname| read_filenames(fname) }
      validate
      load_meta_tags
    end

    # Instanciate all loaded MetaTag implementations
    def load_meta_tags
      # instanciate builtin meta tags
      builtins = MetaTag.descendants
      builtins.each do |cls|
        @meta_tags << cls.new
      end

      # Load user-defined meta-tags
      @meta_tag_paths.each do |path|
        if File.directory?(path)
          Dir[path+"/**/*.rb"].each {|file| require(file) }
        else
          require(path)
        end
      end
      # Instanciate these meta tags.  When builtin implementation for
      # @tag already exists, replace it with user-defined one.
      MetaTag.descendants.each do |cls|
        if !builtins.include?(cls)
          newtag = cls.new
          @meta_tags = @meta_tags.find_all {|t| t.name != newtag.name }
          @meta_tags << newtag
        end
      end
    end

    def create_option_parser
      return OptionParser.new do | opts |
        opts.banner = "Usage: jsduck [options] files/dirs...\n\n"

        opts.on('-o', '--output=PATH',
          "Directory to output all this amazing documentation.",
          "This option MUST be specified (unless --stdout).", " ") do |path|
          @output_dir = canonical(path)
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

        opts.on('--builtin-classes',
          "Includes docs for JavaScript builtin classes.", " ") do
          read_filenames(@root_dir + "/js-classes")
        end

        opts.on('--meta-tags=PATH',
          "Path to Ruby file or directory with custom",
          "meta-tag implementations. Experimantal!", " ") do |path|
          @meta_tag_paths << path
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
          @welcome = canonical(path)
        end

        opts.on('--guides=PATH',
          "Path to JSON file describing the guides. The file",
          "should be in a dir containing the actual guides.",
          "A guide is a dir containing README.md, icon.png,",
          "and other images referenced by the README.md file.", " ") do |path|
          @guides = canonical(path)
        end

        opts.on('--videos=PATH',
          "Path to JSON file describing the videos.", " ") do |path|
          @videos = canonical(path)
        end

        opts.on('--examples=PATH',
          "Path JSON file describing the examples.", " ") do |path|
          @examples = canonical(path)
        end

        opts.on('--categories=PATH',
          "Path to JSON file which defines categories for classes.", " ") do |path|
          @categories_path = canonical(path)
        end

        opts.on('--pretty-json', "Turn on pretty-printing of JSON.", " ") do
          @pretty_json = true
        end

        opts.on('--images=PATH',
          "Search path for including images referenced by",
          "{@img} tag. Several paths can be specified by",
          "using the option multiple times.", " ") do |path|
          @images << path
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
          @template_dir = canonical(path)
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
          @extjs_path = path # NB! must be relative path
        end

        opts.on('--local-storage-db=NAME',
          "Prefix for LocalStorage database names.",
          "Defaults to 'docs'.", " ") do |name|
          @local_storage_db = name
        end

        opts.on('--touch-examples-ui',
          "Use phone/tablet UI for examples.", " ") do
          @touch_examples_ui = true
        end

        opts.on('--ext-namespaces=Ext,Foo', Array,
          "Namespace(s) of ExtJS. Defaults to 'Ext'.", " ") do |ns|
          @ext_namespaces = ns
        end

        opts.on('-h', '--help[=full]',
          "Short help or --help=full for all available options.", " ") do |v|
          if v == 'full'
            puts opts
          else
            puts opts.banner
            puts "For example:"
            puts
            puts "    # Documentation for builtin JavaScript classes like Array and String"
            puts "    jsduck --output output/dir  --builtin-classes"
            puts
            puts "    # Documentation for your own JavaScript"
            puts "    jsduck --output output/dir  input-file.js some/input/dir"
            puts
            puts "The main options:"
            puts

            show_help = false
            main_opts = [
              /--output/,
              /--builtin-classes/,
              /--no-warnings/,
              /--verbose/,
              /--help/,
              /--version/,
            ]
            opts.summarize([], opts.summary_width) do |helpline|
              if main_opts.any? {|re| helpline =~ re }
                puts helpline
                show_help = true
              elsif helpline =~ /^\s*$/ && show_help == true
                puts helpline
                show_help = false
              elsif show_help == true
                puts helpline
              end
            end
          end
          exit
        end

        opts.on('--version', "Prints JSDuck version", " ") do
          puts "JSDuck " + @version
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

    # Converts relative path to full path
    #
    # Especially important for running on Windows where C:\foo\bar
    # pathnames are converted to C:/foo/bar which ruby can work on
    # more easily.
    def canonical(path)
      File.expand_path(path)
    end

    # Runs checks on the options
    def validate
      if @input_files.length == 0 && !@welcome && !@guides && !@videos && !@examples
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
        elsif !@export && !File.exists?(@template_dir + "/extjs")
          puts "Oh noes!  The template directory does not contain extjs/ directory :("
          puts "Please copy ExtJS over to template/extjs or create symlink."
          puts "For example:"
          puts "    $ cp -r /path/to/ext-4.0.0 " + @template_dir + "/extjs"
          exit(1)
        elsif !@export && !File.exists?(@template_dir + "/resources/css")
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
