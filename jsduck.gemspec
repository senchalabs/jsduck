Gem::Specification.new do |s|
  s.required_rubygems_version = ">= 1.3.7"

  s.name = 'jsduck'
  s.version = '0.2'
  s.date = '2011-01-10'
  s.summary = "Simple JavaScript Duckumentation generator"
  s.description = "Better ext-doc like JavaScript documentation generator for ExtJS"
  s.homepage = "https://github.com/nene/jsduck"
  s.authors = ["Rene Saarsoo"]
  s.email = "nene@triin.net"
  s.rubyforge_project = s.name

  s.files = `git ls-files`.split("\n").find_all {|file| file !~ /spec.rb$/ }
  s.executables = ["jsduck"]

  s.add_dependency 'rdiscount'
  s.add_dependency 'json'

  s.require_path = 'lib'
end
