require 'rubygems'
require 'rake'

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)

require 'spec'
require 'spec/rake/spectask'
Spec::Rake::SpecTask.new(:spec) do |spec|
  spec.spec_opts = ["--color"]
  spec.spec_files = FileList["spec/**/*_spec.rb"]
end

desc "Build gem locally"
task :build do
  system "gem build jsduck.gemspec"
end

desc "Install gem locally"
task :install => :build do
  system "gem install --user-install jsduck"
end

task :default => :spec
