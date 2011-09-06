require 'rubygems'
require 'rake'

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)

require 'rspec'
require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.rspec_opts = ["--color"]
  spec.pattern = "spec/**/*_spec.rb"
end

desc "Run compass to generate CSS files"
task :sass do
  system "compass compile --quiet template/resources/sass"
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

def run_on_sdk(extra_options)
  # Pass multiple arguments to system, so we'll take advantage of the built-in escaping
  system(*[
    "ruby", "bin/jsduck",
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
task :sdk => :sass do
  load_sdk_vars
  run_on_sdk([
    "--extjs-path", "extjs/ext-all-debug.js",
    "--seo",
    # to create symbolic links to template files instead of copying them over.
    # Useful for development.  Turn off for deployment.
    "--template-links",
    "--template", "template",
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ])
end

def run_sdk_export(extra_options)
  load_sdk_vars
  rev = `git rev-parse HEAD`.slice(0, 7)
  head_html = <<-EOHTML
    <link rel="canonical" href="http://docs.sencha.com/ext-js/4-0/" />
    <meta name="description" content="Ext JS 4.0 API Documentation from Sencha. Class documentation, Guides and Videos on how to create Javascript applications with Ext JS 4">
  EOHTML

  run_on_sdk([
    "--title", "Sencha Docs - Ext JS 4.0",
    "--footer", "Ext JS 4.0.6 Docs - Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> rev #{rev}",
    "--head-html", head_html,
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ].concat(extra_options))

end

# Use the :export task instead
desc "Base task for creating export"
task :base_export_sdk do
  load_sdk_vars
  run_sdk_export([
    "--body-html", <<-EOHTML
    <div id="notice-text" style="display: none">
      Use <a href="http://docs.sencha.com/ext-js/4-0">http://docs.sencha.com/ext-js/4-0</a> for up to date documentation and features
    </div>
    EOHTML
  ])
end

# Use the :live_docs task instead
desc "Base task for creating live docs"
task :base_live_sdk do
  load_sdk_vars
  run_sdk_export([
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
  run_on_sdk([
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
    "--title", "Sencha Docs - Touch Charts",
    "--ignore-global",
    "--guides", "#{SDK_DIR}/charts/guides",
    "--output", "#{OUT_DIR}",
    "--no-warnings",
    "#{SDK_DIR}/charts/src",
  ])

  system "cp -r #{SDK_DIR}/platform/doc-resources #{OUT_DIR}/doc-resources"
end

def run_on_touch(*extra_options)
  load_sdk_vars
  rev = `git rev-parse HEAD`.slice(0, 7)
  head_html = <<-EOHTML
    <link rel="canonical" href="http://docs.sencha.com/touch/1-0/" />
    <meta name="description" content="Sencha Touch 1.0 API Documentation from Sencha. Documentation on how to create Javascript applications with Sencha Touch">
  EOHTML

  system(*[
    "ruby", "bin/jsduck",
    "--title", "Sencha Docs - Touch 1.0",
    "--seo",
    "--categories", "#{SDK_DIR}/touch/doc-resources/categories.json",
    "--videos", "#{SDK_DIR}/touch/doc-resources/videos.json",
    "--footer", "Sencha Touch 1.0 Documentation from Sencha. Generated with <a href='https://github.com/senchalabs/jsduck'>JSDuck</a> revison #{rev}",
    "--head-html", head_html,
    "--output", "#{OUT_DIR}",
    "#{SDK_DIR}/touch/src/core",
    "#{SDK_DIR}/touch/src/data",
    "#{SDK_DIR}/touch/src/gestures",
    "#{SDK_DIR}/touch/src/layout",
    "#{SDK_DIR}/touch/src/plugins",
    "#{SDK_DIR}/touch/src/util",
    "#{SDK_DIR}/touch/src/widgets",
    "#{SDK_DIR}/touch/src/platform/src",
    "#{SDK_DIR}/touch/resources/themes/stylesheets/sencha-touch/default",
  ].concat(extra_options))

  # Finally copy over the images that documentation links to.
  system "cp -r #{SDK_DIR}/touch/doc-resources #{OUT_DIR}/doc-resources"
end

desc "Run JSDuck on Sencha Touch"
task :touch do
  run_on_touch([
    "--template-links",
    "--template", "template"
  ])
end

desc "Base task for creating live Sencta Touch docs"
task :base_live_touch do
  run_on_touch
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

# Use :export or :live_docs tasks instead of running this separately
desc "Compress JavaScript and CSS files of JSDuck"
task :compress => :sass do
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
  system "rm -rf #{dir}/resources/codemirror"
  system "rm -rf #{dir}/resources/.sass-cache"

  # Empty the extjs dir, leave only the main JS files, CSS and images
  system "rm -rf #{dir}/extjs"
  system "mkdir #{dir}/extjs"
  system "cp #{EXT_DIR}/ext-all.js #{dir}/extjs"
  system "cp #{EXT_DIR}/ext-all-debug.js #{dir}/extjs"
  system "cp #{EXT_DIR}/bootstrap.js #{dir}/extjs"
  system "mkdir -p #{dir}/extjs/resources/css"
  system "cp #{EXT_DIR}/resources/css/ext-all.css #{dir}/extjs/resources/css"
  system "mkdir -p #{dir}/extjs/resources/themes/images"
  system "cp -r #{EXT_DIR}/resources/themes/images/default #{dir}/extjs/resources/themes/images"
end

desc "Copy over SDK examples"
task :copy_sdk_examples do
  system "mkdir #{OUT_DIR}/extjs/builds"
  system "cp #{EXT_DIR}/builds/ext-core.js #{OUT_DIR}/extjs/builds/ext-core.js"
  system "cp #{EXT_DIR}/release-notes.html #{OUT_DIR}/extjs"
  system "cp -r #{EXT_DIR}/examples #{OUT_DIR}/extjs"
  system "cp -r #{EXT_DIR}/welcome #{OUT_DIR}/extjs"
end

desc "Build gem locally"
task :build_gem do
  system "gem build jsduck.gemspec"
end

desc "Run JSDuck on ExtJS SDK to create release version of docs app"
task :export => [:compress, :base_export_sdk, :copy_sdk_examples]

desc "Run JSDuck on ExtJS SDK to create live docs app"
task :live_sdk => [:compress, :base_live_sdk, :copy_sdk_examples]

desc "Run JSDuck on Sencha Touch to create live docs app"
task :live_touch => [:compress, :base_live_touch]

desc "Create gemfile for release"
task :build => [:compress, :build_gem]

task :default => :spec
