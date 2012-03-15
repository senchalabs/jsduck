Gem::Specification.new do |s|
  s.required_rubygems_version = ">= 1.3.5"

  s.name = 'jsduck'
  s.version = '3.8.0'
  s.date = '2012-03-15'
  s.summary = "Simple JavaScript Duckumentation generator"
  s.description = "Documentation generator for Sencha JS frameworks"
  s.homepage = "https://github.com/senchalabs/jsduck"
  s.authors = ["Rene Saarsoo", "Nick Poulden"]
  s.email = "rene.saarsoo@sencha.com"
  s.rubyforge_project = s.name

  s.files = `git ls-files`.split("\n").find_all do |file|
    file !~ /spec.rb$/ && file !~ /benchmark/ && file !~ /template\//
  end
  # Add files not in git
  s.files += Dir['template-min/**/*']

  s.executables = ["jsduck"]

  s.add_dependency 'rdiscount'
  s.add_dependency 'json'
  s.add_dependency 'parallel'

  s.require_path = 'lib'
end
