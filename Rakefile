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
    '--link', '<a href="#/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>',
    # Note that we wrap image template inside <p> because {@img} often
    # appears inline withing text, but that just looks ugly in HTML
    '--img', '<p><img src="doc-resources/%u" alt="%a"></p>',
    "--guides", "#{SDK_DIR}/guides",
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
    # to create symbolic links to template files instead of copying them over.
    # Useful for development.  Turn off for deployment.
    "--template-links",
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ])
end

def run_jsduck_export(extra_options, ext_dir)
  load_sdk_vars
  rev = `git rev-parse HEAD`.slice(0, 7)

  run_jsduck([
    "--title", "Ext JS 4.0.2 API Documentation",
    "--footer", "ExtJS 4.0.2 Documentation from Sencha. Generated with <a href='https://github.com/nene/jsduck'>JSDuck</a> revison #{rev}",
    "--extjs-path", "extjs/ext-all.js",
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ].concat(extra_options))

  system "rm #{OUT_DIR}/extjs"
  system "mkdir -p #{OUT_DIR}/extjs/resources/themes/images"
  system "cp #{EXT_DIR}/ext-all.js #{OUT_DIR}/extjs"
  system "cp -r #{ext_dir}/resources/themes/images/default #{OUT_DIR}/extjs/resources/themes/images"
  system "rm -rf #{ext_dir}/resources/sass"
  system "rm -rf #{OUT_DIR}/resources/.sass-cache"
end

desc "Run JSDuck on ExtJS SDK to create release version of docs app"
task :export do
  load_sdk_vars
  run_jsduck_export([
    "--append-html", <<-EOHTML
    <div id="notice-text" style="display: none">
      Use <a href="http://docs.sencha.com/ext-js/4-0">http://docs.sencha.com/ext-js/4-0</a> for up to date documentation and features
    </div>
    EOHTML
  ], EXT_DIR)
end

desc "Run JSDuck on ExtJS SDK to create live docs app"
task :live_docs do
  load_sdk_vars
  run_jsduck_export([
    "--append-html", <<-EOHTML
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
              },
              showGuide: function(guide) {
                  _gaq.push(['_trackEvent', 'Guides', 'Show', guide]);
              }
          });
      }
    </script>
  EOHTML
  ], "#{SDK_DIR}/extjs/build/sdk")
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

task :default => :spec
