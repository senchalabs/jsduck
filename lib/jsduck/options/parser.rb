require 'jsduck/options/helpful_parser'
require 'jsduck/options/record'
require 'jsduck/options/config'
require 'jsduck/warning/parser'
require 'jsduck/warning/warn_exception'
require 'jsduck/logger'
require 'jsduck/util/io'
require 'jsduck/version'

module JsDuck
  module Options

    # Performs parsing of JSDuck options.
    class Parser

      def initialize
        @opts = Options::Record.new

        @root_dir = File.dirname(File.dirname(File.dirname(File.dirname(__FILE__))))

        @optparser = create_parser
      end

      # Parses array of command line options, returning
      # Options::Record object containing all the options.
      def parse(argv)
        parse_options(argv)
        auto_detect_config_file unless @opts.config
        @opts
      end

      private

      def create_parser
        return Options::HelpfulParser.new do | optparser |
          optparser.banner = "Usage: jsduck [options] files/dirs..."
          optparser.separator ""
          optparser.separator "For example:"
          optparser.separator ""
          optparser.separator "    # Documentation for builtin JavaScript classes like Array and String"
          optparser.separator "    jsduck --output output/dir  --builtin-classes"
          optparser.separator ""
          optparser.separator "    # Documentation for your own JavaScript"
          optparser.separator "    jsduck --output output/dir  input-file.js some/input/dir"
          optparser.separator ""
          optparser.separator "The main options:"
          optparser.separator ""

          @opts.attribute(:input_files, [])
          @opts.validator do
            if @opts.input_files.empty? && !@opts.welcome && !@opts.guides && !@opts.videos && !@opts.examples
              "Please specify some input files, otherwise there's nothing I can do :("
            end
          end

          @opts.attribute(:output_dir)
          optparser.on('-o', '--output=PATH',
            "Directory to write all this documentation.",
            "",
            "This option is REQUIRED.  When the directory exists,",
            "it will be overwritten.  Give dash '-' as argument",
            "to write docs to STDOUT (works only with --export).") do |path|
            if path == "-"
              @opts.output_dir = :stdout
            else
              @opts.output_dir = canonical(path)
              @opts.cache_dir = @opts.output_dir + "/.cache" unless @opts.cache_dir
            end
          end
          @opts.validator do
            if @opts.output_dir == :stdout
              # No output dir needed for export
              if !@opts.export
                "Output to STDOUT only works when using --export option"
              end
            elsif !@opts.output_dir
              "Please specify an output directory, where to write all this amazing documentation"
            elsif File.exists?(@opts.output_dir) && !File.directory?(@opts.output_dir)
              "The output directory is not really a directory at all :("
            elsif !File.exists?(File.dirname(@opts.output_dir))
              "The parent directory for #{@opts.output_dir} doesn't exist"
            end
          end

          @opts.attribute(:export)
          optparser.on('--export=full/examples',
            "Exports docs in JSON.",
            "",
            "For each JavaScript class a JSON file gets written,",
            "the contents of which are as follows:",
            "",
            "- full     - docs and metadata for class and its members.",
            "- examples - inline examples from classes and guides.") do |format|
            @opts.export = format.to_sym
          end
          @opts.validator do
            if ![nil, :full, :examples].include?(@opts.export)
              "Unknown export format: #{@opts.export}"
            end
          end

          optparser.on('--builtin-classes',
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
            @opts.input_files << @root_dir + "/js-classes"
          end

          @opts.attribute(:seo, false)
          optparser.on('--seo', "Enables SEO-friendly print version.",
            "",
            "Instead of index.html creates index.php that will serve",
            "the regular docs, print-friendly docs, and search-engine-",
            "friendly docs (the latter two are pretty much the same).") do
            @opts.seo = true
          end

          @opts.attribute(:config)
          optparser.on('--config=PATH',
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
            @opts.config = path
          end

          @opts.attribute(:encoding)
          optparser.on('--encoding=NAME', "Input encoding (defaults to UTF-8).") do |encoding|
            @opts.encoding = encoding
          end

          @opts.attribute(:exclude, [])
          optparser.on('--exclude=PATH1,PATH2', Array, "Exclude input file or directory.",
            "",
            "For example to include all the subdirs of",
            "/app/js except /app/js/new, run JSDuck with:",
            "",
            "  jsduck /app/js --exclude /app/js/new") do |paths|
            @opts.exclude += paths.map {|p| canonical(p) }
          end

          optparser.separator ""
          optparser.separator "Customizing output:"
          optparser.separator ""

          @opts.attribute(:title, "Documentation - JSDuck")
          @opts.attribute(:header, "<strong>Documentation</strong> JSDuck")
          optparser.on('--title=TEXT',
            "Custom title text for the documentation.",
            "",
            "Defaults to 'Documentation - JSDuck'",
            "",
            "The title will be used both inside <title> and in",
            "the header of the page.  Inside page header the left",
            "part (from ' - ' separator) will be shown in bold.") do |text|
            @opts.title = text
            @opts.header = text.sub(/^(.*?) +- +/, "<strong>\\1 </strong>")
          end

          @opts.attribute(:footer, "Generated on {DATE} by {JSDUCK} {VERSION}.")
          optparser.on('--footer=TEXT',
            "Custom footer text for the documentation.",
            "",
            "The text can contain various placeholders:",
            "",
            "  {DATE} - current date and time.",
            "  {JSDUCK} - link to JSDuck homepage.",
            "  {VERSION} - JSDuck version number.",
            "",
            "Defaults to: 'Generated on {DATE} by {JSDUCK} {VERSION}.'") do |text|
            @opts.footer = text
          end

          @opts.attribute(:head_html, "")
          optparser.on('--head-html=HTML',
            "HTML for the <head> section of index.html.",
            "",
            "Useful for adding extra <style> and other tags.",
            "",
            "Also a name of an HTML file can be passed.",
            "Then the contents of that file will be read in.",
            "",
            "This option can be used repeatedly to append several",
            "things to the header.") do |html|
            @opts.head_html += maybe_file(html)
          end

          @opts.attribute(:body_html, "")
          optparser.on('--body-html=HTML',
            "HTML for the <body> section of index.html.",
            "",
            "Useful for adding extra markup to the page.",
            "",
            "Also a name of an HTML file can be passed.",
            "Then the contents of that file will be read in.",
            "",
            "This option can be used repeatedly to append several",
            "things to the body.") do |html|
            @opts.body_html += maybe_file(html)
          end

          @opts.attribute(:css, "")
          optparser.on('--css=CSS',
            "Extra CSS rules to include to the page.",
            "",
            "Also a name of a CSS file can be passed.",
            "Then the contents of that file will be read in.",
            "",
            "This option can be used repeatedly to append multiple",
            "chunks of CSS.") do |css|
            @opts.css += maybe_file(css)
          end

          @opts.attribute(:message, "")
          optparser.on('--message=HTML',
            "(Warning) message to show prominently.",
            "",
            "Useful for warning users that they are viewing an old",
            "version of the docs, and prividing a link to the new",
            "version.") do |html|
            @opts.message += html
          end

          @opts.attribute(:welcome)
          optparser.on('--welcome=PATH',
            "File with content for welcome page.",
            "",
            "Either HTML or Markdown file with content for welcome page.",
            "HTML file must only contain the <body> part of the page.",
            "Markdown file must have a .md or .markdown extension.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Welcome-page") do |path|
            @opts.welcome = canonical(path)
          end

          @opts.attribute(:guides)
          optparser.on('--guides=PATH',
            "JSON file describing the guides.",
            "",
            "The file should be in a dir containing the actual guides.",
            "A guide is a dir containing README.md, icon.png, and",
            "other images referenced by the README.md file.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Guides") do |path|
            @opts.guides = canonical(path)
          end

          @opts.attribute(:guides_toc_level, 2)
          optparser.on('--guides-toc-level=LEVEL',
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
            @opts.guides_toc_level = level.to_i
          end
          @opts.validator do
            if !(1..6).include?(@opts.guides_toc_level)
              "Unsupported --guides-toc-level: '#{@opts.guides_toc_level}'"
            end
          end

          @opts.attribute(:videos)
          optparser.on('--videos=PATH',
            "JSON file describing the videos.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Videos") do |path|
            @opts.videos = canonical(path)
          end

          @opts.attribute(:examples)
          optparser.on('--examples=PATH',
            "JSON file describing the examples.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Examples") do |path|
            @opts.examples = canonical(path)
          end

          @opts.attribute(:categories_path)
          optparser.on('--categories=PATH',
            "JSON file defining categories for classes.",
            "",
            "Without this option the classes will be categorized",
            "based on how they are namespaced.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Categories") do |path|
            @opts.categories_path = canonical(path)
          end

          @opts.attribute(:source, true)
          optparser.on('--no-source',
            "Turns off the output of source files.") do
            @opts.source = false
          end

          @opts.attribute(:images, [])
          optparser.on('--images=PATH1,PATH2', Array,
            "Paths for images referenced by {@img} tag.",
            "",
            "This option only applies to {@img} tags used in",
            "API (classes/members) documentation.  Images used",
            "in guides must be located inside the directory of",
            "the specific guide.") do |paths|
            @opts.images += paths.map {|p| canonical(p) }
          end

          @opts.attribute(:tests, false)
          optparser.on('--tests',
            "Creates page for testing inline examples.") do
            @opts.tests = true
          end

          @opts.attribute(:imports, [])
          optparser.on('--import=VERSION:PATH',
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
              @opts.imports << {:version => $1, :path => canonical($2)}
            else
              @opts.imports << {:version => v}
            end
          end

          @opts.attribute(:new_since)
          optparser.on('--new-since=VERSION',
            "Since when to label items with @new tag.",
            "",
            "The VERSION must be one of the version names defined",
            "with --import option.",
            "",
            "Defaults to the last version listed by --import.") do |v|
            @opts.new_since = v
          end

          @opts.attribute(:comments_url)
          optparser.on('--comments-url=URL',
            "Address of comments server.",
            "",
            "For example: http://projects.sencha.com/auth",
            "",
            "Must be used together with --comments-domain option.") do |url|
            @opts.comments_url = url
          end

          @opts.attribute(:comments_domain)
          optparser.on('--comments-domain=STRING',
            "A name identifying the subset of comments.",
            "",
            "A string consisting of <name>/<version>.",
            "",
            "For example: ext-js/4",
            "",
            "Must be used together with --comments-url option.") do |domain|
            @opts.comments_domain = domain
          end

          @opts.attribute(:search, {})
          optparser.on('--search-url=URL',
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
            @opts.search[:url] = url
          end

          optparser.on('--search-domain=STRING',
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
            @opts.search[:product], @opts.search[:version] = domain.split(/\//)
          end

          optparser.separator ""
          optparser.separator "Tweaking:"
          optparser.separator ""

          @opts.attribute(:tags, [])
          optparser.on('--tags=PATH1,PATH2', Array,
            "Paths to custom tag implementations.",
            "",
            "Paths can point to specific Ruby files or to a directory,",
            "in which case all ruby files in that directory are loaded.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Custom-tags") do |paths|
            @opts.tags += paths.map {|p| canonical(p) }
          end

          @opts.attribute(:ignore_global, false)
          optparser.on('--ignore-global',
            "Turns off the creation of 'global' class.",
            "",
            "The 'global' class gets created when members that",
            "don't belong to any class are found - all these",
            "members will be placed into the 'global' class.",
            "",
            "Using this option won't suppress the warning that's",
            "given when global members are found.  For that you",
            "need to additionally use --warnings=-global") do
            @opts.ignore_global = true
          end

          @opts.attribute(:external_classes, [
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
          optparser.on('--external=Foo,Bar,Baz', Array,
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
            @opts.external_classes += classes
          end

          @opts.attribute(:ext4_events)
          optparser.on('--[no-]ext4-events',
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
            @opts.ext4_events = e
          end

          @opts.attribute(:examples_base_url)
          optparser.on('--examples-base-url=URL',
            "Base URL for examples with relative URL-s.",
            " ",
            "Defaults to: 'extjs-build/examples/'") do |path|
            @opts.examples_base_url = path
          end

          @opts.attribute(:link_tpl, '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>')
          optparser.on('--link=TPL',
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
            @opts.link_tpl = tpl
          end

          @opts.attribute(:img_tpl, '<p><img src="%u" alt="%a" width="%w" height="%h"></p>')
          optparser.on('--img=TPL',
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
            @opts.img_tpl = tpl
          end

          @opts.attribute(:eg_iframe)
          optparser.on('--eg-iframe=PATH',
            "HTML file used to display inline examples.",
            "",
            "The file will be used inside <iframe> that renders the",
            "example.  Not just any HTML file will work - it needs to",
            "define loadInlineExample function that will be called",
            "with the example code.",
            "",
            "See also: https://github.com/senchalabs/jsduck/wiki/Inline-examples") do |path|
            @opts.eg_iframe = canonical(path)
          end

          @opts.attribute(:ext_namespaces)
          optparser.on('--ext-namespaces=Ext,Foo', Array,
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
            @opts.ext_namespaces = namespaces
          end

          @opts.attribute(:touch_examples_ui, false)
          optparser.on('--touch-examples-ui',
            "Turns on phone/tablet UI for examples.",
            "",
            "This is a very Sencha Touch 2 docs specific option.",
            "Effects both normal- and inline-examples.") do
            @opts.touch_examples_ui = true
          end

          @opts.attribute(:ignore_html, {})
          optparser.on('--ignore-html=TAG1,TAG2', Array,
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
              @opts.ignore_html[tag] = true
            end
          end

          optparser.separator ""
          optparser.separator "Performance:"
          optparser.separator ""

          @opts.attribute(:processes)
          optparser.on('-p', '--processes=COUNT',
            "The number of parallel processes to use.",
            "",
            "Defaults to the number of processors/cores.",
            "",
            "Set to 0 to disable parallel processing completely.",
            "This is often useful in debugging to get deterministic",
            "results.",
            "",
            "In Windows this option is disabled.") do |count|
            @opts.processes = count.to_i
          end

          @opts.attribute(:cache, false)
          optparser.on('--[no-]cache',
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
            @opts.cache = enabled
          end

          @opts.attribute(:cache_dir)
          optparser.on('--cache-dir=PATH',
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
            @opts.cache_dir = path
          end

          optparser.separator ""
          optparser.separator "Debugging:"
          optparser.separator ""

          @opts.attribute(:verbose, false)
          optparser.on('-v', '--verbose',
            "Turns on excessive logging.",
            "",
            "Log messages are written to STDERR.") do
            @opts.verbose = true
          end

          @opts.attribute(:warnings, [])
          optparser.on('--warnings=+A,-B,+C',
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
              @opts.warnings += Warning::Parser.new(warnings).parse
            rescue Warning::WarnException => e
              Logger.warn(nil, e.message)
            end
          end

          @opts.attribute(:warnings_exit_nonzero, false)
          optparser.on('--warnings-exit-nonzero',
            "Exits with non-zero exit code on warnings.",
            "",
            "By default JSDuck only exits with non-zero exit code",
            "when a fatal error is encountered (code 1).",
            "",
            "With this option the exit code will be 2 when any warning",
            "gets printed.") do
            @opts.warnings_exit_nonzero = true
          end

          @opts.attribute(:color)
          optparser.on('--[no-]color',
            "Turn on/off colorized terminal output.",
            "",
            "By default the colored output is on, but gets disabled",
            "automatically when output is not an interactive terminal",
            "(or when running on Windows system).") do |on|
            @opts.color = on
          end

          @opts.attribute(:pretty_json)
          optparser.on('--pretty-json',
            "Turns on pretty-printing of JSON.",
            "",
            "This is useful when studying the JSON files generated",
            "by --export option.  But the option effects any JSON",
            "that gets generated, so it's also useful when debugging",
            "the resource files generated for the docs app.") do
            @opts.pretty_json = true
          end

          @opts.attribute(:template_dir, @root_dir + "/template-min")
          optparser.on('--template=PATH',
            "Dir containing the UI template files.",
            "",
            "Useful when developing the template files.") do |path|
            @opts.template_dir = canonical(path)
          end
          @opts.validator do
            if @opts.export
              # Don't check these things when exporting
            elsif !File.exists?(@opts.template_dir + "/extjs")
              [
                "Oh noes!  The template directory does not contain extjs/ directory :(",
                "Please copy ExtJS over to template/extjs or create symlink.",
                "For example:",
                "    $ cp -r /path/to/ext-4.0.0 " + @opts.template_dir + "/extjs",
              ]
            elsif !File.exists?(@opts.template_dir + "/resources/css")
              [
                "Oh noes!  CSS files for custom ExtJS theme missing :(",
                "Please compile SASS files in template/resources/sass with compass.",
                "For example:",
                "    $ compass compile " + @opts.template_dir + "/resources/sass",
              ]
            end
          end

          @opts.attribute(:template_links, false)
          optparser.on('--template-links',
            "Creates symlinks to UI template files.",
            "",
            "Useful for template files development.",
            "Only works on platforms supporting symbolic links.") do
            @opts.template_links = true
          end

          optparser.on('-d', '--debug',
            "Same as --template=template --template-links.",
            "",
            "Useful shorthand during development.") do
            @opts.template_dir = canonical("template")
            @opts.template_links = true
          end

          @opts.attribute(:extjs_path, "extjs/ext-all.js")
          optparser.on('--extjs-path=PATH',
            "Path for main ExtJS JavaScript file.",
            "",
            "This is the ExtJS file that's used by the docs app UI.",
            "",
            "Defaults to extjs/ext-all.js",
            "",
            "Useful for switching to extjs/ext-all-debug.js in development.") do |path|
            @opts.extjs_path = path # NB! must be relative path
          end

          @opts.attribute(:local_storage_db, "docs")
          optparser.on('--local-storage-db=NAME',
            "Prefix for LocalStorage database names.",
            "",
            "Defaults to 'docs'") do |name|
            @opts.local_storage_db = name
          end

          optparser.on('-h', '--help[=--some-option]',
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
              puts optparser.help_single(v)
            else
              puts optparser.help
            end
            exit
          end

          optparser.on('--version', "Prints JSDuck version") do
            puts "JSDuck " + JsDuck::VERSION + " (Ruby #{RUBY_VERSION})"
            exit
          end
        end
      end

      # Parses the given command line options
      # (could have also been read from config file)
      def parse_options(options)
        @optparser.parse!(options).each do |fname|
          @opts.input_files << canonical(fname)
        end
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
      def read_json_config(filename)
        Options::Config.read(filename)
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

    end

  end
end
