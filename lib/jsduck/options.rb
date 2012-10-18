require 'optparse'
require 'jsduck/meta_tag_registry'
require 'jsduck/logger'
require 'jsduck/json_duck'

module JsDuck

  # Keeps command line options
  class Options
    attr_accessor :input_files

    attr_accessor :output_dir
    attr_accessor :ignore_global
    attr_accessor :external_classes

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
    attr_accessor :stats
    attr_accessor :categories_path
    attr_accessor :source
    attr_accessor :pretty_json
    attr_accessor :images
    attr_accessor :link_tpl
    attr_accessor :img_tpl
    attr_accessor :export
    attr_accessor :seo
    attr_accessor :eg_iframe
    attr_accessor :examples_base_url
    attr_accessor :tests

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
      @meta_tag_paths = []

      @version = "3.11.1"

      # Customizing output
      @title = "Titanium Mobile"
      @header = "<strong>Titanium</strong>"
      @footer = "Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> #{@version}."
      @head_html = ""
      @body_html = ""
      @welcome = nil
      @guides = nil
      @videos = nil
      @examples = nil
      @stats = false
      @categories_path = nil
      @source = true
      @pretty_json = false
      @images = []
      @link_tpl = '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'
      # Note that we wrap image template inside <p> because {@img} often
      # appears inline within text, but that just looks ugly in HTML
      @img_tpl = '<p><img src="%u" alt="%a"></p>'
      @export = nil
      @seo = false
      @eg_iframe = nil
      @examples_base_url = "extjs-build/examples/"
      @tests = false

      # Debugging
      # Turn multiprocessing off by default in Windows
      @processes = OS::windows? ? 0 : nil
      @root_dir = File.dirname(File.dirname(File.dirname(__FILE__)))
      @template_dir = @root_dir + "/template-min"
      @template_links = false
      @extjs_path = "extjs/ext-all.js"
      @local_storage_db = "docs"
      @touch_examples_ui = false
      @ext_namespaces = ["Ext"]

      # enable all warnings except :link_auto
      Logger.instance.set_warning(:all, true)
      Logger.instance.set_warning(:link_auto, false)
    end

    # Make options object behave like hash.
    # This allows us to substitute it with hash in unit tests.
    def [](key)
      send(key)
    end

    def parse!(argv)
      create_option_parser.parse!(argv).each do |fname|
        read_filenames(canonical(fname))
      end
      validate

      reg = MetaTagRegistry.new
      reg.load([:builtins] + @meta_tag_paths)
      MetaTagRegistry.instance = reg
    end

    def create_option_parser
      optparser = OptionParser.new do | opts |
        opts.banner = "Usage: jsduck [options] files/dirs...\n\n"

        opts.on('-o', '--output=PATH',
          "Directory to output all this amazing documentation.",
          "This option MUST be specified (unless --stdout).",
          "Use dash '-' to write docs to STDOUT (only export).", " ") do |path|
          @output_dir = path == "-" ? :stdout : canonical(path)
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
          "meta-tag implementations.", " ") do |path|
          @meta_tag_paths << canonical(path)
        end

        opts.on('--encoding=NAME', "Input encoding (defaults to UTF-8).", " ") do |encoding|
          JsDuck::IO.encoding = encoding
        end

        opts.on('-v', '--verbose', "This will fill up your console.", " ") do
          Logger.instance.verbose = true
        end

        opts.separator "Customizing output:"
        opts.separator ""

        opts.on('--title=TEXT',
          "Custom title text for the documentation.",
          "Defaults to 'Ext JS - Sencha Docs'", " ") do |text|
          @title = text
          @header = text.sub(/^(.*?) +- +.*/, "<strong>\\1 </strong>")
        end

        opts.on('--footer=TEXT',
          "Custom footer text for the documentation.",
          "Defaults to: 'Generated with JSDuck {VERSION}.'", " ") do |text|
          @footer = text.gsub(/\{VERSION\}/, @version)
        end

        opts.on('--head-html=HTML', "HTML to append to the <head> section of index.html.", " ") do |html|
          @head_html += html
        end

        opts.on('--body-html=HTML', "HTML to append to the <body> section index.html.", " ") do |html|
          @body_html += html
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

        opts.on('--no-source',
          "Turns off the output of source files.", " ") do
          @source = false
        end

        opts.on('--pretty-json', "Turn on pretty-printing of JSON.", " ") do
          @pretty_json = true
        end

        opts.on('--images=PATH',
          "Search path for including images referenced by",
          "{@img} tag. Several paths can be specified by",
          "using the option multiple times.", " ") do |path|
          @images << canonical(path)
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
          "Default is: '<p><img src=\"%u\" alt=\"%a\"></p>'", " ") do |tpl|
          @img_tpl = tpl
        end

        opts.on('--export=TYPE',
          "Exports docs in JSON.  TYPE is one of:",
          "* full     - full class docs.",
          "* api      - only class- and member names.",
          "* examples - extracts inline examples from classes.", " ") do |format|
          @export = format.to_sym
        end

        opts.on('--seo', "Creates index.php that handles search engine traffic.", " ") do
          @seo = true
        end

        opts.on('--eg-iframe=PATH',
          "An HTML file to use inside an iframe",
          "to display inline examples.", " ") do |path|
          @eg_iframe = canonical(path)
        end

        opts.on('--examples-base-url=URL',
          "Base URL for examples with relative URL-s.", " ") do |path|
          @examples_base_url = path
        end

        opts.on('--tests', "Creates page for testing inline examples.", " ") do
          @tests = true
        end

        opts.on('--stats',
          "Creates page with all kinds of statistics. Experimental!", " ") do
          @stats = true
        end

        opts.separator "Debugging:"
        opts.separator ""

        opts.on('--warnings=+A,-B,+C', Array,
          "Turns warnings selectively on/off.",
          " ",
          " +all - to turn on all warnings",
          " ",
          "By default these warnings are turned +on/-off:",
          " ",
          *Logger.instance.doc_warnings) do |warnings|
          warnings.each do |op|
            if op =~ /^([-+]?)(.*)$/
              enable = !($1 == "-")
              name = $2.to_sym
              Logger.instance.set_warning(name, enable)
            end
          end
        end

        # For debugging it's often useful to set --processes=0 to get deterministic results.
        opts.on('-p', '--processes=COUNT',
          "The number of parallel processes to use.",
          OS::windows? ? "Defaults to off in Windows." : "Defaults to the number of processors/cores.",
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

        opts.on('--config=PATH',
          "Loads config options from JSON file.", " ") do |path|
          path = canonical(path)
          if File.exists?(path)
            config = read_json_config(path)
          else
            puts "Oh noes!  The config file #{path} doesn't exist."
            exit(1)
          end
          # treat paths inside JSON config relative to the location of
          # config file.  When done, switch back to current working dir.
          @working_dir = File.dirname(path)
          optparser.parse!(config).each {|fname| read_filenames(canonical(fname)) }
          @working_dir = nil
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
              /--encoding/,
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

      return optparser
    end

    # Reads JSON configuration from file and returns an array of
    # config options that can be feeded into optparser.
    def read_json_config(fname)
      config = []
      json = JsonDuck.read(fname)
      json.each_pair do |key, value|
        if key == "--"
          # filenames
          config += Array(value).map(&:to_s)
        elsif value == true
          # simple switch
          config += [key.to_s]
        else
          # An option with value or with multiple values.
          # In the latter case, add the option multiple times.
          Array(value).each do |v|
            config += [key.to_s, v.to_s]
          end
        end
      end
      config
    end

    # scans directory for .js files or simply adds file to input files list
    def read_filenames(fname)
      if File.exists?(fname)
        if File.directory?(fname)
          Dir[fname+"/**/*.{js,css,scss}"].each {|f| @input_files << f }
        elsif fname =~ /\.jsb3$/
          extract_jsb_files(fname).each {|fn| read_filenames(fn) }
        else
          @input_files << fname
        end
      else
        Logger.instance.warn(nil, "File #{fname} not found")
      end
    end

    # Extracts files of first build in jsb file
    def extract_jsb_files(jsb_file)
      json = JsonDuck::read(jsb_file)
      basedir = File.dirname(jsb_file)

      return json["builds"][0]["packages"].map do |package_id|
        package = json["packages"].find {|p| p["id"] == package_id }
        (package ? package["files"] : []).map do |file|
          File.expand_path(basedir + "/" + file["path"] + file["name"])
        end
      end.flatten
    end

    # Converts relative path to full path
    #
    # Especially important for running on Windows where C:\foo\bar
    # pathnames are converted to C:/foo/bar which ruby can work on
    # more easily.
    def canonical(path)
      File.expand_path(path, @working_dir)
    end

    # Runs checks on the options
    def validate
      if @input_files.length == 0 && !@welcome && !@guides && !@videos && !@examples
        puts "You should specify some input files, otherwise there's nothing I can do :("
        exit(1)
      elsif @output_dir == :stdout && !@export
        puts "Output to STDOUT only works when using --export option."
        exit(1)
      elsif ![nil, :full, :api, :examples].include?(@export)
        puts "Unknown export format: #{@export}"
        exit(1)
      elsif @output_dir != :stdout
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
