require 'rubygems'
require 'rake'

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)

require 'rspec'
require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.rspec_opts = ["--color"]
  spec.pattern = "spec/**/*_spec.rb"
end

desc "Build gem locally"
task :build do
  system "gem build jsduck.gemspec"
end

desc "Install gem locally"
task :install => :build do
  system "gem install --user-install jsduck"
end

def load_sdk_vars
  if File.exists?("sdk-vars.rb")
    require "sdk-vars.rb"
  else
    puts "Error: sdk-vars.rb not found."
    puts
    puts "Please create file sdk-vars.rb and define constants SDK_DIR and OUT_DIR in it."
    puts
    puts "For example:"
    puts
    puts "    SDK_DIR='/path/to/SDK'"
    puts "    OUT_DIR='/path/to/ouput/dir'"
    puts "    EXT_DIR='/path/to/ext/dir'"
    exit 1
  end
end

def run_jsduck(extra_options)
  # Pass multiple arguments to system, so we'll take advantage of the built-in escaping
  system(*[
    "ruby", "bin/jsduck",
    # --external=Error to ignore the Error class that Ext.Error extends.
    "--external", "Error",
    "--welcome", "template/welcome.html",
    "--guides", "#{SDK_DIR}/guides/guides.json",
    "--videos", "#{SDK_DIR}/guides/videos.json",
    "--examples", "#{SDK_DIR}/extjs/examples/examples.json",
    "--inline-examples", "#{SDK_DIR}/extjs/doc-resources",
    "--categories", "#{SDK_DIR}/extjs/doc-resources/categories.json",
    "--output", "#{OUT_DIR}",
  ].concat(extra_options))

  # Finally copy over the images that documentation links to.
  system "cp -r #{SDK_DIR}/extjs/doc-resources #{OUT_DIR}/doc-resources"
  system "cp -r #{SDK_DIR}/platform/doc-resources/* #{OUT_DIR}/doc-resources"
end

desc "Run JSDuck on ExtJS SDK"
task :sdk do
  load_sdk_vars
  run_jsduck([
    "--extjs-path", "extjs/ext-all-debug.js",
    # to create symbolic links to template files instead of copying them over.
    # Useful for development.  Turn off for deployment.
    "--template-links",
    "--seo",
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ])
end

def run_jsduck_export(extra_options)
  load_sdk_vars
  rev = `git rev-parse HEAD`.slice(0, 7)
  head_html = <<-EOHTML
    <link rel="canonical" href="http://docs.sencha.com/ext-js/4-0/" />
    <meta name="description" content="Ext JS 4.0 API Documentation from Sencha. Class documentation, Guides and Videos on how to create Javascript applications with Ext JS 4">
  EOHTML

  run_jsduck([
    "--title", "Ext JS 4.0 API Documentation",
    "--footer", "ExtJS 4.0 Documentation from Sencha. Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> revison #{rev}",
    "--head-html", head_html,
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ].concat(extra_options))

end

# Use the :export task instead
desc "Base task for creating export"
task :base_export do
  load_sdk_vars
  run_jsduck_export([
    "--body-html", <<-EOHTML
    <div id="notice-text" style="display: none">
      Use <a href="http://docs.sencha.com/ext-js/4-0">http://docs.sencha.com/ext-js/4-0</a> for up to date documentation and features
    </div>
    EOHTML
  ])
end

# Use the :live_docs task instead
desc "Base task for creating live docs"
task :base_live_docs do
  load_sdk_vars
  run_jsduck_export([
    "--seo",
    "--body-html", <<-EOHTML
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-1396058-10']);
      _gaq.push(['_trackPageview']);
      (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
      })();

      Docs.initEventTracking = function() {
          Docs.App.getController('Classes').addListener({
              showClass: function(cls) {
                  _gaq.push(['_trackEvent', 'Classes', 'Show', cls]);
              },
              showMember: function(cls, anchor) {
                  _gaq.push(['_trackEvent', 'Classes', 'Member', cls + ' - ' + anchor]);
              }
          });
          Docs.App.getController('Guides').addListener({
              showGuide: function(guide) {
                  _gaq.push(['_trackEvent', 'Guides', 'Show', guide]);
              }
          });
          Docs.App.getController('Videos').addListener({
              showVideo: function(video) {
                  _gaq.push(['_trackEvent', 'Video', 'Show', video]);
              }
          });
          Docs.App.getController('Examples').addListener({
              showExample: function(example) {
                  _gaq.push(['_trackEvent', 'Example', 'Show', example]);
              }
          });
      }
    </script>
  EOHTML
  ])
end

desc "Run JSDuck on the Docs app itself"
task :docs do
  load_sdk_vars
  run_jsduck([
    "--template-links",
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
    "template/app",
    "template/app.js",
  ])
end

desc "Run JSDuck on ExtJS charts"
task :charts do
  load_sdk_vars
  system(*[
    "ruby", "bin/jsduck",
    "--title", "Sencha Touch Charts API Documentation",
    "--external", "Error",
    "--ignore-global",
    "--guides", "#{SDK_DIR}/charts/guides",
    "--output", "#{OUT_DIR}",
    "--no-warnings",
    "#{SDK_DIR}/charts/src",
  ])

  system "cp -r #{SDK_DIR}/platform/doc-resources #{OUT_DIR}/doc-resources"
end


# Compress JS/CSS file in-place
# Using a hackish way to access yui-compressor
def yui_compress(fname)
  system "java -jar $(dirname $(which sencha))/../jsbuilder/ycompressor/ycompressor.jar -o #{fname} #{fname}"
end

# Reads in all CSS files referenced between BEGIN CSS and END CSS markers.
# Deletes those input CSS files and writes out concatenated CSS to
# resources/css/app.css
# Finally replaces the CSS section with <link> to that one CSS file.
def combine_css(html, base_dir, opts = :write)
  css_section_re = /<!-- BEGIN CSS -->.*<!-- END CSS -->/m
  css = []
  css_section_re.match(html)[0].each_line do |line|
    if line =~ /<link rel="stylesheet" href="(.*?)"/
      file = $1
      css << IO.read(base_dir + "/" + file)
      system("rm", base_dir + "/" + file) if opts == :write
    end
  end

  if opts == :write
    fname = "#{OUT_DIR}/resources/css/app.css"
    File.open(fname, 'w') {|f| f.write(css.join("\n")) }
    yui_compress(fname)
  end
  html.sub(css_section_re, '<link rel="stylesheet" href="resources/css/app.css" type="text/css" />')
end

# Same thing for JavaScript, result is written to: app.js
def combine_js(html, base_dir)
  js_section_re = /<!-- BEGIN JS -->.*<!-- END JS -->/m
  js = []
  js_section_re.match(html)[0].each_line do |line|
    if line =~ /<script .* src="(.*)">/
      file = $1
      js << IO.read(base_dir + "/" + file)
      if file !~ /ext\.js/
        system("rm", base_dir + "/" + file)
      end
    elsif line =~ /<script .*>(.*)<\/script>/
      js << $1
    end
  end

  fname = "#{OUT_DIR}/app.js"
  File.open(fname, 'w') {|f| f.write(js.join("\n")) }
  yui_compress(fname)
  html.sub(js_section_re, '<script type="text/javascript" src="app.js"></script>')
end

# Use :export or :live_docs tasks instead of running this separately
desc "Compresses JavaScript and CSS files in output dir"
task :compress do
  load_sdk_vars
  # Detect if we are using index.html or template.html
  index_html = File.exists?("#{OUT_DIR}/index.html") ? "#{OUT_DIR}/index.html" : "#{OUT_DIR}/template.html"
  # Create JSB3 file for Docs app
  system("sencha", "create", "jsb", "-a", index_html, "-p", "#{OUT_DIR}/app.jsb3")
  # Concatenate files listed in JSB3 file
  system("sencha", "build", "-p", "#{OUT_DIR}/app.jsb3", "-d", OUT_DIR)
  # Remove intermediate build files
  system("rm", "#{OUT_DIR}/app.jsb3")
  system("rm", "#{OUT_DIR}/all-classes.js")
  # Replace app.js with app-all.js
  system("mv", "#{OUT_DIR}/app-all.js", "#{OUT_DIR}/app.js")
  # Remove the entire app/ dir
  system("rm", "-r", "#{OUT_DIR}/app")

  # Optionally concatenate CSS in print-template.html file
  print_template = "#{OUT_DIR}/print-template.html";
  if File.exists?(print_template)
    html = IO.read(print_template);
    # Just modify HTML to link app.css, don't write files.
    html = combine_css(html, OUT_DIR, :replace_html_only)
    File.open(print_template, 'w') {|f| f.write(html) }
  end

  # Concatenate CSS and JS files referenced in index.html file
  html = IO.read(index_html)
  html = combine_css(html, OUT_DIR)
  html = combine_js(html, OUT_DIR)
  File.open(index_html, 'w') {|f| f.write(html) }

  # Clean up SASS files
  system "rm -rf #{OUT_DIR}/resources/sass"
  system "rm -rf #{OUT_DIR}/resources/codemirror"
  system "rm -rf #{OUT_DIR}/resources/prettify"
  system "rm -rf #{OUT_DIR}/resources/.sass-cache"

  # Empty the extjs dir, leave only the main JS files, CSS and images
  system "rm -rf #{OUT_DIR}/extjs"
  system "mkdir -p #{OUT_DIR}/extjs/resources/css"
  system "mkdir -p #{OUT_DIR}/extjs/resources/themes/images"
  system "cp #{EXT_DIR}/ext-all.js #{OUT_DIR}/extjs"
  system "cp #{EXT_DIR}/ext-all-debug.js #{OUT_DIR}/extjs"
  system "cp #{EXT_DIR}/bootstrap.js #{OUT_DIR}/extjs"
  system "cp #{EXT_DIR}/resources/css/ext-all.css #{OUT_DIR}/extjs/resources/css"
  system "cp -r #{EXT_DIR}/examples #{OUT_DIR}/extjs"
  system "cp -r #{EXT_DIR}/resources/themes/images/default #{OUT_DIR}/extjs/resources/themes/images"
end

desc "Run JSDuck on ExtJS SDK to create release version of docs app"
task :export => [:base_export, :compress]

desc "Run JSDuck on ExtJS SDK to create live docs app"
task :live_docs => [:base_live_docs, :compress]

task :default => :spec
