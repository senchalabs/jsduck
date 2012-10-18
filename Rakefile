require 'rubygems'
require 'rake'

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)

def os_is_windows?
  RbConfig::CONFIG['host_os'] =~ /mswin|mingw|cygwin/
end

require 'rspec'
require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.rspec_opts = ["--color"] unless os_is_windows?
  spec.pattern = "spec/**/*_spec.rb"
end

def load_sdk_vars
  if File.exists?("sdk-vars.rb")
    require "./sdk-vars.rb"
  else
    puts "Error: sdk-vars.rb not found."
    puts
    puts "Please create file sdk-vars.rb and define in it:"
    puts
    puts "    # where to output the docs"
    puts "    OUT_DIR='/path/to/ouput/dir'"
    puts "    # path to Ext JS 4 build"
    puts "    EXT_BUILD='/path/to/ext-4'"
    puts "    # path to Touch 2 build"
    puts "    TOUCH_BUILD='/path/to/touch-2'"
    puts "    # path to SDK (for developers at Sencha)"
    puts "    SDK_DIR='/path/to/SDK'"
    exit 1
  end
end

# Compress JS/CSS file in-place
# Using a hackish way to access yui-compressor
def yui_compress(fname)
  system "java -jar $(dirname $(which sencha))/bin/yuicompressor.jar -o #{fname} #{fname}"
end

# Reads in all CSS files referenced between BEGIN CSS and END CSS markers.
# Deletes those input CSS files and writes out concatenated CSS to
# resources/css/app.css
# Finally replaces the CSS section with <link> to that one CSS file.
def combine_css(html, dir, opts = :write)
  css_section_re = /<!-- BEGIN CSS -->.*<!-- END CSS -->/m
  css = []
  css_section_re.match(html)[0].each_line do |line|
    if line =~ /<link rel="stylesheet" href="(.*?)"/
      file = $1
      css << IO.read(dir + "/" + file)
      system("rm", dir + "/" + file) if opts == :write
    end
  end

  if opts == :write
    fname = "#{dir}/resources/css/app.css"
    File.open(fname, 'w') {|f| f.write(css.join("\n")) }
    yui_compress(fname)
  end
  html.sub(css_section_re, '<link rel="stylesheet" href="resources/css/app.css" type="text/css" />')
end

# Same thing for JavaScript, result is written to: app.js
def combine_js(html, dir)
  js_section_re = /<!-- BEGIN JS -->.*<!-- END JS -->/m
  js = []
  js_section_re.match(html)[0].each_line do |line|
    if line =~ /<script .* src="(.*)">/
      file = $1
      js << IO.read(dir + "/" + file)
      if file !~ /ext\.js/
        system("rm", dir + "/" + file)
      end
    elsif line =~ /<script .*>(.*)<\/script>/
      js << $1
    end
  end

  fname = "#{dir}/app.js"
  File.open(fname, 'w') {|f| f.write(js.join("\n")) }
  yui_compress(fname)
  html.sub(js_section_re, '<script type="text/javascript" src="app.js"></script>')
end

# Compress JavaScript and CSS files of JSDuck
def compress
  load_sdk_vars

  # Clean up template-min/ left over from previous compress task
  system("rm", "-rf", "template-min")
  # Copy template/ files to template-min/
  system("cp", "-r", "template", "template-min")
  # Now do everything that follows in template-min/ dir
  dir = "template-min"

  # Create JSB3 file for Docs app
  system("sencha", "create", "jsb", "-a", "#{dir}/build-js.html", "-p", "#{dir}/app.jsb3")
  # Concatenate files listed in JSB3 file
  system("sencha", "build", "-p", "#{dir}/app.jsb3", "-d", dir)

  # Remove intermediate build files
  system("rm", "#{dir}/app.jsb3")
  system("rm", "#{dir}/all-classes.js")
  # Replace app.js with app-all.js
  system("mv", "#{dir}/app-all.js", "#{dir}/app.js")
  # Remove the entire app/ dir
  system("rm", "-r", "#{dir}/app")

  # Concatenate CSS in print-template.html file
  print_template = "#{dir}/print-template.html";
  html = IO.read(print_template);
  # Just modify HTML to link app.css, don't write files.
  html = combine_css(html, dir, :replace_html_only)
  File.open(print_template, 'w') {|f| f.write(html) }

  # Concatenate CSS and JS files referenced in template.html file
  template_html = "#{dir}/template.html"
  html = IO.read(template_html)
  html = combine_css(html, dir)
  html = combine_js(html, dir)
  File.open(template_html, 'w') {|f| f.write(html) }

  # Clean up SASS files
  # (But keep prettify lib, which is needed for source files)
  system "rm -rf #{dir}/resources/sass"
  # system "rm -rf #{dir}/resources/codemirror"
  system "rm -rf #{dir}/resources/.sass-cache"

  # Empty the extjs dir, leave only the main JS file and images
  system "rm -rf #{dir}/extjs"
  system "mkdir #{dir}/extjs"
  system "cp template/extjs/ext-all.js #{dir}/extjs"
  system "mkdir -p #{dir}/extjs/resources/themes/images"
  system "cp -r template/extjs/resources/themes/images/default #{dir}/extjs/resources/themes/images"
  system "cp -r template/extjs/resources/css #{dir}/extjs/resources/css"
end


class JsDuckRunner
  def initialize
    @options = []
    load_sdk_vars
  end

  def add_options(*options)
    @options += options
  end

  # Enables comments when CORS is supported by browser.
  # This excludes Opera and IE < 8.
  # We check explicitly for IE version to make sure the code works the
  # same way in both real IE7 and IE7-mode of IE8/9.
  def add_comments(db_name, version)
    comments_base_url = "http://projects.sencha.com/auth"
    @options += ["--head-html", <<-EOHTML]
      <script type="text/javascript">
        Docs.enableComments = ("withCredentials" in new XMLHttpRequest()) || (Ext.ieVersion >= 8);
        Docs.baseUrl = "#{comments_base_url}";
        Docs.commentsDb = "#{db_name}";
        Docs.commentsVersion = "#{version}";
      </script>
    EOHTML
  end

  def add_ext4
    @options += [
      "--title", "Sencha Docs - Ext JS 4.0",
      "--footer", "Ext JS 4.0 Docs - Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> {VERSION}." +
                  " <a href='http://www.sencha.com/legal/terms-of-use/'>Terms of Use</a>",
      "--ignore-global",
      "--warnings", "-all",
      "--images", "#{EXT_BUILD}/docs/doc-resources",
      "--local-storage-db", "ext-4",
      "--output", "#{OUT_DIR}",
      "#{EXT_BUILD}/src",
    ]
  end

  def add_debug
    add_options(
      "--extjs-path", "extjs/ext-all-debug.js",
      "--template", "template"
    )
    add_options("--template-links") unless os_is_windows?
  end

  def run
    # Pass multiple arguments to system, so we'll take advantage of the built-in escaping
    system(*["ruby", "bin/jsduck"].concat(@options))
  end
end

# Run compass to generate CSS files
task :sass do
  system "compass compile --quiet template/resources/sass"
end

desc "Compress output"
task :compress => :sass do
  compress
end

desc "Build JSDuck gem"
task :gem => :sass do
  compress
  system "gem build jsduck.gemspec"
end

desc "Run JSDuck on Docs app itself"
task :docs do
  runner = JsDuckRunner.new
  runner.add_ext4
  runner.add_options(
    "--builtin-classes",
    "template/app"
  )
  runner.add_debug
  runner.run
end

desc "Run JSDuck on official Ext JS 4 build"
task :ext4 => :sass do
  runner = JsDuckRunner.new
  runner.add_ext4
  runner.add_debug
  runner.add_options("--tests")
  runner.run

  system("cp -r #{EXT_BUILD} #{OUT_DIR}/extjs-build")
end

desc "Run JSDuck on Ext JS from SDK repo (for internal use at Sencha)"
task :sdk => :sass do
  runner = JsDuckRunner.new
  runner.add_options(
    "--output", OUT_DIR,
    "--config", "#{SDK_DIR}/extjs/docs/config.json",
    "--examples-base-url", "extjs-build/examples/",
    "--seo",
    "--tests"
  )
  runner.add_debug
  runner.add_comments('ext-js', '4')
  runner.run

  system("cp -r #{EXT_BUILD} #{OUT_DIR}/extjs-build")
end

desc "Run JSDuck on Sencha Touch 2 repo (for internal use at Sencha)"
task :touch2 => :sass do
  runner = JsDuckRunner.new
  runner.add_options(
    "--output", OUT_DIR,
    "--config", "#{SDK_DIR}/touch/docs/config.json",
    "--examples-base-url", "touch-build/examples/production/",
    "--seo",
    "--tests"
  )

  runner.add_debug
  runner.add_comments('touch', '2')
  runner.run

  system("cp -r #{TOUCH_BUILD} #{OUT_DIR}/touch-build")
end

desc "Run JSDuck on Titanium Mobile repo (for internal use at Appcelerator)"
task :timobile => :sass do
  runner = JsDuckRunner.new
  runner.add_options(
    "--config", "#{DOCTOOLS_DIR}/jsduck.config"
  )

  # runner.add_debug
  # runner.add_comments('touch', '2')
  runner.run
end
task :default => :spec
