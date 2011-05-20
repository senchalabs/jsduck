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
    exit 1
  end
end

def run_jsduck(paths, template_links = true)
  system [
    "ruby bin/jsduck",
    # --external=Error to ignore the Error class that Ext.Error extends.
    "--external=Error",
    # to create symbolic links to template files instead of copying them over.
    # Useful for development.  Turn off for deployment.
    (template_links ? "--template-links" : ""),
    '--link=\'<a href="#/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>\'',
    # Note that we wrap image template inside <p> because {@img} often
    # appears inline withing text, but that just looks ugly in HTML
    '--img=\'<p><img src="doc-resources/%u" alt="%a"></p>\'',
    "--guides=#{SDK_DIR}/guides",
    "--output=#{OUT_DIR}",
  ].concat(paths).join(" ")

  # Finally copy over the images that documentation links to.
  system "cp -r #{SDK_DIR}/extjs/doc-resources #{OUT_DIR}/doc-resources"
  system "cp -r #{SDK_DIR}/platform/doc-resources/* #{OUT_DIR}/doc-resources"
end

desc "Run JSDuck on ExtJS SDK"
task :sdk do
  load_sdk_vars
  run_jsduck([
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ])
end

desc "Run JSDuck on ExtJS SDK for export"
task :export do
  load_sdk_vars
  run_jsduck([
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
  ], false)
  
  system "mkdir -p #{OUT_DIR}/extjs/resources/themes"
  system "cp #{SDK_DIR}/build/sdk/extjs-all.js #{OUT_DIR}/extjs"
  system "cp -r #{SDK_DIR}/build/sdk/resources/themes/images #{OUT_DIR}/extjs/resources/themes"
end

desc "Run JSDuck on the Docs app itself"
task :docs do
  load_sdk_vars
  run_jsduck([
    "#{SDK_DIR}/extjs/src",
    "#{SDK_DIR}/platform/src",
    "#{SDK_DIR}/platform/core/src",
    "template/app",
    "template/app.js",
  ])
end

task :default => :spec
