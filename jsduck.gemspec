Gem::Specification.new do |s|
  s.required_rubygems_version = ">= 1.3.5"

  s.name = 'jsduck'
  s.version = '5.3.2'
  s.date = Time.new.strftime('%Y-%m-%d')
  s.summary = "Simple JavaScript Duckumentation generator"
  s.description = "Documentation generator for Sencha JS frameworks"
  s.homepage = "https://github.com/senchalabs/jsduck"
  s.authors = ["Rene Saarsoo", "Nick Poulden"]
  s.email = "rene.saarsoo@sencha.com"
  s.rubyforge_project = s.name
  s.license = "GPL-3"

  s.files = ['bin/jsduck', 'COPYING', 'README.md']
  s.files += Dir['lib/**/*']
  s.files += Dir['js-classes/**/*']
  s.files += Dir['template-min/**/*']

  s.executables = ["jsduck"]

  s.add_dependency 'rdiscount', '~> 2.1.6'
  s.add_dependency 'json', '~> 1.8.0'
  s.add_dependency 'parallel', '~> 0.7.1'
  s.add_dependency 'rkelly-remix', '~> 0.0.4'
  s.add_dependency 'dimensions', '~> 1.2.0'

  s.add_development_dependency 'rspec'
  s.add_development_dependency 'rake'
  s.add_development_dependency 'compass'

  s.require_path = 'lib'
end
