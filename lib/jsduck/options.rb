require 'jsduck/option_parser'
require 'jsduck/logger'
require 'jsduck/util/json'
require 'jsduck/util/os'
require 'jsduck/util/io'
require 'jsduck/util/parallel'
require 'jsduck/tag_registry'
require 'jsduck/js/ext_patterns'
require 'jsduck/warning/parser'
require 'jsduck/version'

module JsDuck

  # Keeps command line options
  class Options

    def initialize
      @custom_tag_paths = []
      @root_dir = File.dirname(File.dirname(File.dirname(__FILE__)))

      # Turn multiprocessing off by default in Windows
      Util::Parallel.in_processes = Util::OS::windows? ? 0 : nil

      # Enable all warnings except the following:
      Logger.set_warning(:all, true)
      Logger.set_warning(:link_auto, false)
      Logger.set_warning(:param_count, false)
      Logger.set_warning(:fires, false)
      Logger.set_warning(:nodoc, false)

      @optparser = create_option_parser
    end

    # Make options object behave like hash.
    # This allows us to substitute it with hash in unit tests.
    def [](key)
      instance_variable_get("@#{key}")
    end
    def []=(key, value)
      instance_variable_set("@#{key}", value)
    end

    def parse!(argv)
      parse_options(argv)
      auto_detect_config_file unless @config_option_specified
      exclude_input_files
      validate

      if @custom_tag_paths.length > 0
        TagRegistry.reconfigure(@custom_tag_paths)
      else
        # Ensure the TagRegistry get instantiated just once.
        # Otherwise the parallel processing causes multiple requests
        # to initialize the TagRegistry, resulting in loading the Tag
        # definitions multiple times.
        TagRegistry.instance
      end

      # The tooltip of @new can now be configured.
      TagRegistry.get_by_name(:new).init_tooltip!(self)
    end

    private

    def create_option_parser
      return JsDuck::OptionParser.new do | opts |
        opts.banner = "Usage: jsduck [options] files/dirs..."
        opts.separator ""
        opts.separator "For example:"
        opts.separator ""
        opts.separator "    # Documentation for builtin JavaScript classes like Array and String"
        opts.separator "    jsduck --output output/dir  --builtin-classes"
        opts.separator ""
        opts.separator "    # Documentation for your own JavaScript"
        opts.separator "    jsduck --output output/dir  input-file.js some/input/dir"
        opts.separator ""
        opts.separator "The main options:"
        opts.separator ""

        def_attribute(:input_files, [])

        def_attribute(:output_dir)
        opts.on('-o', '--output=PATH',
          "Directory to write all this documentation.",
          "",
          "This option is REQUIRED.  When the directory exists,",
          "it will be overwritten.  Give dash '-' as argument",
          "to write docs to STDOUT (works only with --export).") do |path|
          if path == "-"
            @output_dir = :stdout
          else
            @output_dir = canonical(path)
            @cache_dir = @output_dir + "/.cache" unless @cache_dir
          end
        end

        def_attribute(:export)
        opts.on('--export=full/examples',
          "Exports docs in JSON.",
          "",
          "For each JavaScript class a JSON file gets written,",
          "the contents of which are as follows:",
          "",
          "- full     - docs and metadata for class and its members.",
          "- examples - inline examples from classes and guides.") do |format|
          export_type = format.to_sym
          if [:full, :examples].include?(export_type)
            @export = export_type
          else
            Logger.fatal("Unsupported export type: '#{export_type}'")
            exit(1)
          end
        end

        opts.on('--builtin-classes',
          "Includes docs for JavaScript builtins.",
          "",
          "Docs for the following classes are included:",
          "",
          "- Array",
          "- Boolean",
          "- Date",
          "- Function",
          "- Number",
          "- Object",
          "- RegExp",
          "- String") do
          read_filenames(@root_dir + "/js-classes")
        end

        def_attribute(:seo, false)
        opts.on('--seo', "Enables SEO-friendly print version.",
          "",
          "Instead of index.html creates index.php that will serve",
          "the regular docs, print-friendly docs, and search-engine-",
          "friendly docs (the latter two are pretty much the same).") do
          @seo = true
        end

        opts.on('--config=PATH',
          "Loads config options from JSON file.",
          "",
          "An alternative to listing all options on command line.",
          "",
          "When the current directory contains jsduck.json file",
          "then options are automatically read from there.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Config-file") do |path|
          path = canonical(path)
          if File.exists?(path)
            config = read_json_config(path)
          else
            Logger.fatal("The config file #{path} doesn't exist")
            exit(1)
          end
          # treat paths inside JSON config relative to the location of
          # config file.  When done, switch back to current working dir.
          @working_dir = File.dirname(path)
          parse_options(config)
          @working_dir = nil
          @config_option_specified = true
        end

        opts.on('--encoding=NAME', "Input encoding (defaults to UTF-8).") do |encoding|
          JsDuck::Util::IO.encoding = encoding
        end

        def_attribute(:exclude, [])
        opts.on('--exclude=PATH1,PATH2', Array, "Exclude input file or directory.",
          "",
          "For example to include all the subdirs of",
          "/app/js except /app/js/new, run JSDuck with:",
          "",
          "  jsduck /app/js --exclude /app/js/new") do |paths|
          @exclude += paths
        end

        opts.separator ""
        opts.separator "Customizing output:"
        opts.separator ""

        def_attribute(:title, "Documentation - JSDuck")
        def_attribute(:header, "<strong>Documentation</strong> JSDuck")
        opts.on('--title=TEXT',
          "Custom title text for the documentation.",
          "",
          "Defaults to 'Documentation - JSDuck'",
          "",
          "The title will be used both inside <title> and in",
          "the header of the page.  Inside page header the left",
          "part (from ' - ' separator) will be shown in bold.") do |text|
          @title = text
          @header = text.sub(/^(.*?) +- +/, "<strong>\\1 </strong>")
        end

        def_attribute(:footer, format_footer("Generated on {DATE} by {JSDUCK} {VERSION}."))
        opts.on('--footer=TEXT',
          "Custom footer text for the documentation.",
          "",
          "The text can contain various placeholders:",
          "",
          "  {DATE} - current date and time.",
          "  {JSDUCK} - link to JSDuck homepage.",
          "  {VERSION} - JSDuck version number.",
          "",
          "Defaults to: 'Generated on {DATE} by {JSDUCK} {VERSION}.'") do |text|
          @footer = format_footer(text)
        end

        def_attribute(:head_html, "")
        opts.on('--head-html=HTML',
          "HTML for the <head> section of index.html.",
          "",
          "Useful for adding extra <style> and other tags.",
          "",
          "Also a name of an HTML file can be passed.",
          "Then the contents of that file will be read in.",
          "",
          "This option can be used repeatedly to append several",
          "things to the header.") do |html|
          @head_html += maybe_file(html)
        end

        def_attribute(:body_html, "")
        opts.on('--body-html=HTML',
          "HTML for the <body> section of index.html.",
          "",
          "Useful for adding extra markup to the page.",
          "",
          "Also a name of an HTML file can be passed.",
          "Then the contents of that file will be read in.",
          "",
          "This option can be used repeatedly to append several",
          "things to the body.") do |html|
          @body_html += maybe_file(html)
        end

        def_attribute(:css, "")
        opts.on('--css=CSS',
          "Extra CSS rules to include to the page.",
          "",
          "Also a name of a CSS file can be passed.",
          "Then the contents of that file will be read in.",
          "",
          "This option can be used repeatedly to append multiple",
          "chunks of CSS.") do |css|
          @css += maybe_file(css)
        end

        def_attribute(:message, "")
        opts.on('--message=HTML',
          "(Warning) message to show prominently.",
          "",
          "Useful for warning users that they are viewing an old",
          "version of the docs, and prividing a link to the new",
          "version.") do |html|
          @message += html
        end

        def_attribute(:welcome)
        opts.on('--welcome=PATH',
          "File with content for welcome page.",
          "",
          "Either HTML or Markdown file with content for welcome page.",
          "HTML file must only contain the <body> part of the page.",
          "Markdown file must have a .md or .markdown extension.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Welcome-page") do |path|
          @welcome = canonical(path)
        end

        def_attribute(:guides)
        opts.on('--guides=PATH',
          "JSON file describing the guides.",
          "",
          "The file should be in a dir containing the actual guides.",
          "A guide is a dir containing README.md, icon.png, and",
          "other images referenced by the README.md file.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Guides") do |path|
          @guides = canonical(path)
        end

        def_attribute(:guides_toc_level, 2)
        opts.on('--guides-toc-level=LEVEL',
          "Max heading level for guides' tables of contents.",
          "",
          "Values between 1 and 6 define the maximum level of a heading",
          "to be included into guides' Table of Contents:",
          "",
          "1 - Hides the table of contents.",
          "2 - <H2> headings are included.",
          "3 - <H2>,<H3> headings are included.",
          "4 - <H2>,<H3>,<H4> headings are included.",
          "5 - <H2>,<H3>,<H4>,<H5> headings are included.",
          "6 - <H2>,<H3>,<H4>,<H5>,<H6> headings are included.") do |level|
          @guides_toc_level = level.to_i
          if !(1..6).include? @guides_toc_level
            Logger.fatal("Unsupported --guides-toc-level: '#{level}'")
            exit(1)
          end
        end

        def_attribute(:videos)
        opts.on('--videos=PATH',
          "JSON file describing the videos.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Videos") do |path|
          @videos = canonical(path)
        end

        def_attribute(:examples)
        opts.on('--examples=PATH',
          "JSON file describing the examples.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Examples") do |path|
          @examples = canonical(path)
        end

        def_attribute(:categories_path)
        opts.on('--categories=PATH',
          "JSON file defining categories for classes.",
          "",
          "Without this option the classes will be categorized",
          "based on how they are namespaced.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Categories") do |path|
          @categories_path = canonical(path)
        end

        def_attribute(:source, true)
        opts.on('--no-source',
          "Turns off the output of source files.") do
          @source = false
        end

        def_attribute(:images, [])
        opts.on('--images=PATH1,PATH2', Array,
          "Paths for images referenced by {@img} tag.",
          "",
          "This option only applies to {@img} tags used in",
          "API (classes/members) documentation.  Images used",
          "in guides must be located inside the directory of",
          "the specific guide.") do |paths|
          @images += paths.map {|p| canonical(p) }
        end

        def_attribute(:tests, false)
        opts.on('--tests',
          "Creates page for testing inline examples.") do
          @tests = true
        end

        def_attribute(:imports, [])
        opts.on('--import=VERSION:PATH',
          "Imports docs generating @since & @new.",
          "",
          "For example:",
          "",
          "    --import='1.0:/path/to/first/version'",
          "    --import='2.0:/path/to/second/version'",
          "    --import='3.0'",
          "",
          "Several versions can be imported using the option multiple",
          "times.  The last version must always be the current one",
          "without the :PATH portion.",
          "",
          "JSDuck will then check in which version every class/member",
          "first appears in and tag it with an appropriate @since tag.",
          "Things appearing only in the latest version will also get",
          "a @new tag (unless --new-since option is used).",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/@since") do |v|
          if v =~ /\A(.*?):(.*)\z/
            @imports << {:version => $1, :path => canonical($2)}
          else
            @imports << {:version => v}
          end
        end

        def_attribute(:new_since)
        opts.on('--new-since=VERSION',
          "Since when to label items with @new tag.",
          "",
          "The VERSION must be one of the version names defined",
          "with --import option.",
          "",
          "Defaults to the last version listed by --import.") do |v|
          @new_since = v
        end

        def_attribute(:comments_url)
        opts.on('--comments-url=URL',
          "Address of comments server.",
          "",
          "For example: http://projects.sencha.com/auth",
          "",
          "Must be used together with --comments-domain option.") do |url|
          @comments_url = url
        end

        def_attribute(:comments_domain)
        opts.on('--comments-domain=STRING',
          "A name identifying the subset of comments.",
          "",
          "A string consisting of <name>/<version>.",
          "",
          "For example: ext-js/4",
          "",
          "Must be used together with --comments-url option.") do |domain|
          @comments_domain = domain
        end

        def_attribute(:search, {})
        opts.on('--search-url=URL',
          "Address of guides search server.",
          "",
          "When supplied, the search for guides is performed through this",
          "external service and the results merged together with API search.",
          "The search server must respond to JSONP requests.",
          "",
          "For example: http://sencha.com/docsearch",
          "",
          "Must be used together with --search-domain option.",
          "",
          "This option is EXPERIMENTAL.") do |url|
          @search[:url] = url
        end

        opts.on('--search-domain=STRING',
          "A name identifying the subset to search from.",
          "",
          "A string consisting of <name>/<version>.",
          "",
          "Tells the search engine which product and version",
          "to include into search.",
          "",
          "For example: Ext JS/4.2.0",
          "",
          "Must be used together with --search-url option.",
          "",
          "This option is EXPERIMENTAL.") do |domain|
          @search[:product], @search[:version] = domain.split(/\//)
        end

        opts.separator ""
        opts.separator "Tweaking:"
        opts.separator ""

        opts.on('--tags=PATH1,PATH2', Array,
          "Paths to custom tag implementations.",
          "",
          "Paths can point to specific Ruby files or to a directory,",
          "in which case all ruby files in that directory are loaded.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Custom-tags") do |paths|
          @custom_tag_paths += paths.map {|p| canonical(p) }
        end

        def_attribute(:ignore_global, false)
        opts.on('--ignore-global',
          "Turns off the creation of 'global' class.",
          "",
          "The 'global' class gets created when members that",
          "don't belong to any class are found - all these",
          "members will be placed into the 'global' class.",
          "",
          "Using this option won't suppress the warning that's",
          "given when global members are found.  For that you",
          "need to additionally use --warnings=-global") do
          @ignore_global = true
        end

        def_attribute(:external_classes, [
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
            # JavaScript builtin error classes
            # https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error
            "Error",
            "EvalError",
            "RangeError",
            "ReferenceError",
            "SyntaxError",
            "TypeError",
            "URIError",
            # DOM
            "HTMLElement",
            "XMLElement",
            "NodeList",
            "TextNode",
            "CSSStyleSheet",
            "CSSStyleRule",
            "Event",
            # Other browser-environment classes
            "Window",
            "XMLHttpRequest",
            # Special anything-goes type
            "Mixed",
          ])
        opts.on('--external=Foo,Bar,Baz', Array,
          "Declares list of external classes.",
          "",
          "These classes will then no more generate warnings",
          "when used in type definitions or inherited from.",
          "",
          "Multiple classes can be given in comma-separated list,",
          "or by using the option repeatedly.",
          "",
          "The wildcard '*' can be used to match a set of classes",
          "e.g. to ignore all classes of a particular namespace:",
          "--external='Foo.*'") do |classes|
          @external_classes += classes
        end

        def_attribute(:ext4_events)
        opts.on('--[no-]ext4-events',
          "Forces Ext4 options param on events.",
          "",
          "In Ext JS 4 and Sencha Touch 2 all event handlers are",
          "passed an additional options object at the end of the",
          "parameters list.  This options object is skipped in the",
          "documentation of Ext4/Touch2 events, so it needs to be",
          "appended by JSDuck.",
          "",
          "The default is to auto-detect if we're using Ext JS 4",
          "or Sencha Touch 2 based on whether the code defines",
          "classes using Ext.define(), and only then append the",
          "options parameter.  This should work most of the time.",
          "",
          "Use this option to override the auto-detection.") do |e|
          @ext4_events = e
        end

        def_attribute(:examples_base_url)
        opts.on('--examples-base-url=URL',
          "Base URL for examples with relative URL-s.",
          " ",
          "Defaults to: 'extjs-build/examples/'") do |path|
          @examples_base_url = path
        end

        def_attribute(:link_tpl, '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>')
        opts.on('--link=TPL',
          "HTML template for replacing {@link}.",
          "",
          "Possible placeholders:",
          "",
          "%c - full class name (e.g. 'Ext.Panel')",
          "%m - class member name prefixed with member type",
          "     (e.g. 'method-urlEncode')",
          "%# - inserts '#' if member name present",
          "%- - inserts '-' if member name present",
          "%a - anchor text for link",
          "",
          "Defaults to: '<a href=\"#!/api/%c%-%m\" rel=\"%c%-%m\" class=\"docClass\">%a</a>'") do |tpl|
          @link_tpl = tpl
        end

        def_attribute(:img_tpl, '<p><img src="%u" alt="%a" width="%w" height="%h"></p>')
        opts.on('--img=TPL',
          "HTML template for replacing {@img}.",
          "",
          "Possible placeholders:",
          "",
          "%u - URL from @img tag (e.g. 'some/path.png')",
          "%a - alt text for image",
          "%w - width of image",
          "%h - height of image",
          "",
          "Defaults to: '<p><img src=\"%u\" alt=\"%a\" width=\"%w\" height=\"%h\"></p>'") do |tpl|
          @img_tpl = tpl
        end

        def_attribute(:eg_iframe)
        opts.on('--eg-iframe=PATH',
          "HTML file used to display inline examples.",
          "",
          "The file will be used inside <iframe> that renders the",
          "example.  Not just any HTML file will work - it needs to",
          "define loadInlineExample function that will be called",
          "with the example code.",
          "",
          "See also: https://github.com/senchalabs/jsduck/wiki/Inline-examples") do |path|
          @eg_iframe = canonical(path)
        end

        opts.on('--ext-namespaces=Ext,Foo', Array,
          "Additional Ext JS namespaces to recognize.",
          "",
          "Defaults to 'Ext'",
          "",
          "Useful when using Ext JS in sandbox mode where instead",
          "of Ext.define() your code contains YourNs.define().",
          "In such case pass --ext-namespaces=Ext,YourNS option",
          "and JSDuck will recognize both Ext.define() and",
          "YourNs.define() plus few other things that depend on",
          "Ext namespace like Ext.emptyFn.") do |namespaces|
          Js::ExtPatterns.set(namespaces)
        end

        def_attribute(:touch_examples_ui, false)
        opts.on('--touch-examples-ui',
          "Turns on phone/tablet UI for examples.",
          "",
          "This is a very Sencha Touch 2 docs specific option.",
          "Effects both normal- and inline-examples.") do
          @touch_examples_ui = true
        end

        def_attribute(:ignore_html, {})
        opts.on('--ignore-html=TAG1,TAG2', Array,
          "Ignore a particular unclosed HTML tag.",
          "",
          "Normally all tags like <foo> that aren't followed at some",
          "point with </foo> will get automatically closed by JSDuck",
          "and a warning will be generated.  Except standard void tags",
          "like <img> and <br>.  Use this option to specify additional",
          "tags not requirering a closing tag.",
          "",
          "Useful for ignoring the ExtJS preprocessor directives",
          "<locale> and <debug> which would otherwise be reported",
          "as unclosed tags.") do |tags|
          tags.each do |tag|
            @ignore_html[tag] = true
          end
        end

        opts.separator ""
        opts.separator "Performance:"
        opts.separator ""

        opts.on('-p', '--processes=COUNT',
          "The number of parallel processes to use.",
          "",
          "Defaults to the number of processors/cores.",
          "",
          "Set to 0 to disable parallel processing completely.",
          "This is often useful in debugging to get deterministic",
          "results.",
          "",
          "In Windows this option is disabled.") do |count|
          Util::Parallel.in_processes = count.to_i
        end

        def_attribute(:cache, false)
        opts.on('--[no-]cache',
          "Turns parser cache on/off (EXPERIMENTAL).",
          "",
          "Defaults to off.",
          "",
          "When enabled, the results of parsing source files is saved",
          "inside the JSDuck output directory. Next time JSDuck runs,",
          "only the files that have changed are parsed again, others",
          "are read from the cache.",
          "",
          "Note that switching between Ruby and/or JSDuck versions",
          "invalidates the whole cache.  But changes in custom tags",
          "don't invalidate the cache, so avoid caching when developing",
          "your custom tags.",
          "",
          "To change the cache directory location, use --cache-dir.") do |enabled|
          @cache = enabled
        end

        def_attribute(:cache_dir)
        opts.on('--cache-dir=PATH',
          "Directory where to cache the parsed source.",
          "",
          "Defaults to: <output-dir>/.cache",
          "",
          "Each project needs to have a separate cache directory.",
          "Instead of writing the cache into the output directory,",
          "one might consider keeping it together with the source",
          "files.",
          "",
          "Note that JSDuck ensures that the <output-dir>/.cache",
          "dir is preserved when the rest of the <output-dir> gets",
          "wiped clean during the docs generation.  If you specify",
          "cache dir like <output-dir>/.mycache, then this will also",
          "be cleaned up during docs generation, and the caching",
          "won't work.",
          "",
          "This option only has an effect when --cache is also used.") do |path|
          @cache_dir = path
        end

        opts.separator ""
        opts.separator "Debugging:"
        opts.separator ""

        opts.on('-v', '--verbose',
          "Turns on excessive logging.",
          "",
          "Log messages are written to STDERR.") do
          Logger.verbose = true
        end

        opts.on('--warnings=+A,-B,+C',
          "Turns warnings selectively on/off.",
          "",
          " +all - to turn on all warnings.",
          " -all - to turn off all warnings.",
          "",
          "Additionally a pattern can be specified to only apply the",
          "setting for a particular set of files.  (The pattern is just",
          "a string against which the the full path of each filename",
          "gets matched - attempting to use a pattern like '../foo' will",
          "fail.)  For example to turn off all warnings related to chart",
          "classes:",
          "",
          " -all:extjs/src/chart",
          "",
          "Note, that the order of the rules matters.  When you first",
          "say +link and then -all, the result will be that all warnings",
          "get disabled.",
          "",
          "List of all available warning types:",
          "(Those with '+' in front of them default to on)",
          "",
          *Logger.doc_warnings) do |warnings|
          begin
            Warning::Parser.new(warnings).parse.each do |w|
              Logger.set_warning(w[:type], w[:enabled], w[:path], w[:params])
            end
          rescue Warning::WarnException => e
            Logger.warn(nil, e.message)
          end
        end

        def_attribute(:warnings_exit_nonzero, false)
        opts.on('--warnings-exit-nonzero',
          "Exits with non-zero exit code on warnings.",
          "",
          "By default JSDuck only exits with non-zero exit code",
          "when a fatal error is encountered (code 1).",
          "",
          "With this option the exit code will be 2 when any warning",
          "gets printed.") do
          @warnings_exit_nonzero = true
        end

        opts.on('--[no-]color',
          "Turn on/off colorized terminal output.",
          "",
          "By default the colored output is on, but gets disabled",
          "automatically when output is not an interactive terminal",
          "(or when running on Windows system).") do |on|
          Logger.colors = on
        end

        opts.on('--pretty-json',
          "Turns on pretty-printing of JSON.",
          "",
          "This is useful when studying the JSON files generated",
          "by --export option.  But the option effects any JSON",
          "that gets generated, so it's also useful when debugging",
          "the resource files generated for the docs app.") do
          Util::Json.pretty = true
        end

        def_attribute(:template_dir, @root_dir + "/template-min")
        opts.on('--template=PATH',
          "Dir containing the UI template files.",
          "",
          "Useful when developing the template files.") do |path|
          @template_dir = canonical(path)
        end

        def_attribute(:template_links, false)
        opts.on('--template-links',
          "Creates symlinks to UI template files.",
          "",
          "Useful for template files development.",
          "Only works on platforms supporting symbolic links.") do
          @template_links = true
        end

        opts.on('-d', '--debug',
          "Same as --template=template --template-links.",
          "",
          "Useful shorthand during development.") do
          @template_dir = canonical("template")
          @template_links = true
        end

        def_attribute(:extjs_path, "extjs/ext-all.js")
        opts.on('--extjs-path=PATH',
          "Path for main ExtJS JavaScript file.",
          "",
          "This is the ExtJS file that's used by the docs app UI.",
          "",
          "Defaults to extjs/ext-all.js",
          "",
          "Useful for switching to extjs/ext-all-debug.js in development.") do |path|
          @extjs_path = path # NB! must be relative path
        end

        def_attribute(:local_storage_db, "docs")
        opts.on('--local-storage-db=NAME',
          "Prefix for LocalStorage database names.",
          "",
          "Defaults to 'docs'") do |name|
          @local_storage_db = name
        end

        opts.on('-h', '--help[=--some-option]',
          "Use --help=--option for help on option.",
          "",
          "For example To get help on --processes option any of the",
          "following will work:",
          "",
          "    --help=--processes",
          "    --help=processes",
          "    --help=-p",
          "    --help=p") do |v|
          if v
            puts opts.help_single(v)
          else
            puts opts.help
          end
          exit
        end

        opts.on('--version', "Prints JSDuck version") do
          puts "JSDuck " + JsDuck::VERSION + " (Ruby #{RUBY_VERSION})"
          exit
        end
      end
    end

    # Defines accessor for an option,
    # and assigns a default value for it.
    def def_attribute(name, default=nil)
      instance_variable_set("@#{name}", default)
      # Use `send` to invoke private attr_accessor method.
      self.class.send(:attr_accessor, name)
    end

    # Parses the given command line options
    # (could have also been read from config file)
    def parse_options(options)
      @optparser.parse!(options).each {|fname| read_filenames(canonical(fname)) }
    end

    # Reads jsduck.json file in current directory
    def auto_detect_config_file
      fname = Dir.pwd + "/jsduck.json"
      if File.exists?(fname)
        Logger.log("Auto-detected config file", fname)
        parse_options(read_json_config(fname))
      end
    end

    # Reads JSON configuration from file and returns an array of
    # config options that can be feeded into optparser.
    def read_json_config(fname)
      config = []
      json = Util::Json.read(fname)
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
        Logger.warn(nil, "File not found", fname)
      end
    end

    # When --exclude option used, removes the files matching the
    # exclude path from @input_files
    def exclude_input_files
      @exclude.each do |exclude_path|
        exclude_re = Regexp.new('\A' + Regexp.escape(canonical(exclude_path)))
        @input_files.reject! {|f| f =~ exclude_re }
      end
    end

    # Extracts files of first build in jsb file
    def extract_jsb_files(jsb_file)
      json = Util::Json.read(jsb_file)
      basedir = File.dirname(jsb_file)

      return json["builds"][0]["packages"].map do |package_id|
        package = json["packages"].find {|p| p["id"] == package_id }
        (package ? package["files"] : []).map do |file|
          File.expand_path(basedir + "/" + file["path"] + file["name"])
        end
      end.flatten
    end

    # When given string is a file, returns the contents of the file.
    # Otherwise returns the string unchanged.
    def maybe_file(str)
      path = canonical(str)
      if File.exists?(path)
        Util::IO.read(path)
      else
        str
      end
    end

    # Converts relative path to full path
    #
    # Especially important for running on Windows where C:\foo\bar
    # pathnames are converted to C:/foo/bar which ruby can work on
    # more easily.
    def canonical(path)
      File.expand_path(path, @working_dir)
    end

    # Replace special placeholders in footer text
    def format_footer(text)
      jsduck = "<a href='https://github.com/senchalabs/jsduck'>JSDuck</a>"
      date = Time.new.strftime('%a %d %b %Y %H:%M:%S')
      text.gsub(/\{VERSION\}/, JsDuck::VERSION).gsub(/\{JSDUCK\}/, jsduck).gsub(/\{DATE\}/, date)
    end

    # Runs checks on the options
    def validate
      if @input_files.length == 0 && !@welcome && !@guides && !@videos && !@examples
        Logger.fatal("You should specify some input files, otherwise there's nothing I can do :(")
        exit(1)
      elsif @output_dir == :stdout && !@export
        Logger.fatal("Output to STDOUT only works when using --export option")
        exit(1)
      elsif ![nil, :full, :api, :examples].include?(@export)
        Logger.fatal("Unknown export format: #{@export}")
        exit(1)
      elsif @output_dir != :stdout
        if !@output_dir
          Logger.fatal("You should also specify an output directory, where I could write all this amazing documentation")
          exit(1)
        elsif File.exists?(@output_dir) && !File.directory?(@output_dir)
          Logger.fatal("The output directory is not really a directory at all :(")
          exit(1)
        elsif !File.exists?(File.dirname(@output_dir))
          Logger.fatal("The parent directory for #{@output_dir} doesn't exist")
          exit(1)
        elsif !@export && !File.exists?(@template_dir + "/extjs")
          Logger.fatal("Oh noes!  The template directory does not contain extjs/ directory :(")
          Logger.fatal("Please copy ExtJS over to template/extjs or create symlink.")
          Logger.fatal("For example:")
          Logger.fatal("    $ cp -r /path/to/ext-4.0.0 " + @template_dir + "/extjs")
          exit(1)
        elsif !@export && !File.exists?(@template_dir + "/resources/css")
          Logger.fatal("Oh noes!  CSS files for custom ExtJS theme missing :(")
          Logger.fatal("Please compile SASS files in template/resources/sass with compass.")
          Logger.fatal("For example:")
          Logger.fatal("    $ compass compile " + @template_dir + "/resources/sass")
          exit(1)
        end
      end
    end

  end

end
