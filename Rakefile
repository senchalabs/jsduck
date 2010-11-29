require 'rubygems'
require 'rake'

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)

require 'rake/testtask'
Rake::TestTask.new(:test) do |test|
  test.pattern = 'test/**/tc_*.rb'
  test.verbose = true
end

require 'spec'
require 'spec/rake/spectask'
Spec::Rake::SpecTask.new(:spec) do |spec|
  spec.spec_opts = ["--color"]
  spec.spec_files = FileList["spec/**/*_spec.rb"]
end

task :default => :test
