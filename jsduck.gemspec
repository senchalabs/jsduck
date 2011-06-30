Gem::Specification.new do |s|
  s.required_rubygems_version = ">= 1.3.7"

  s.name = 'jsduck'
  s.version = '2.0.pre'
  s.date = '2011-06-30'
  s.summary = "Simple JavaScript Duckumentation generator"
  s.description = "Documentation generator for ExtJS 4"
  s.homepage = "https://github.com/nene/jsduck"
  s.authors = ["Rene Saarsoo", "Nick Poulden"]
  s.email = "rene.saarsoo@sencha.com"
  s.rubyforge_project = s.name

  s.files = `git ls-files`.split("\n").find_all do |file|
    file !~ /spec.rb$/ && file !~ /benchmark/ && file !~ /resources\/sass/
  end
  # Add files not in git
  s.files += ['template/extjs/ext-all.js']
  s.files += Dir['template/resources/css/*.css']

  s.executables = ["jsduck"]

  s.add_dependency 'rdiscount'
  s.add_dependency 'json'
  s.add_dependency 'parallel'

  s.require_path = 'lib'
end
