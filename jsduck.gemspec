Gem::Specification.new do |s|
  s.required_rubygems_version = ">= 1.3.7"

  s.name = 'jsduck'
  s.version = '0.5'
  s.date = '2011-03-29'
  s.summary = "Simple JavaScript Duckumentation generator"
  s.description = "Better ext-doc like JavaScript documentation generator for ExtJS"
  s.homepage = "https://github.com/nene/jsduck"
  s.authors = ["Rene Saarsoo"]
  s.email = "nene@triin.net"
  s.rubyforge_project = s.name

  s.files = `git ls-files`.split("\n").find_all do |file|
    file !~ /spec.rb$/ && file !~ /benchmark/
  end

  s.executables = ["jsduck"]

  s.add_dependency 'rdiscount'
  s.add_dependency 'json'
  s.add_dependency 'parallel'

  s.require_path = 'lib'
end
