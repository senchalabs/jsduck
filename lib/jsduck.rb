# JsDuck is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# JsDuck is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with JsDuck.  If not, see <http://www.gnu.org/licenses/>.
#
# Copyright 2010 Rene Saarsoo.

$:.unshift File.dirname(__FILE__) # For running the actual JsDuck app

require 'jsduck/aggregator'
require 'jsduck/class'
require 'jsduck/tree'
require 'jsduck/tree_icons'
require 'jsduck/page'
require 'json'

require 'optparse'
require 'fileutils'
require 'pp'

module JsDuck
  def self.parse(input)
    agr = Aggregator.new
    agr.parse(input)
    agr.result
  end

  # Given array of filenames, parses all files and returns array of
  # documented items in all of those files.
  def self.parse_files(filenames, verbose)
    agr = Aggregator.new
    filenames.each do |name|
      puts "Parsing #{name} ..." if verbose
      agr.parse(IO.read(name))
    end
    agr.result
  end

  # Filters out class-documentations, converting them to Class objects.
  # For each other type, prints a warning message and discards it
  def self.filter_classes(docs)
    classes = {}
    docs.each do |d|
      if d[:tagname] == :class
        classes[d[:name]] = Class.new(d, classes)
      else
        puts "Warning: Ignoring " + d[:tagname].to_s + ": " + (d[:name] || "")
      end
    end
    classes.values
  end

  def self.print_debug(docs)
    docs.each do |doc|
      puts (doc[:name] || "?") + ":"
      if doc[:tagname] == :class
        [:cfg, :property, :method, :event].each do |key|
          puts "  " + key.to_s + "s:"
          doc[key].each {|item| puts "    " + (item[:name] || "?")}
        end
      end
      puts
    end
  end

  # Given array of doc-objects, generates namespace tree and writes in
  # in JSON form into a file.
  def self.write_tree(filename, docs)
    tree = Tree.new.create(docs)
    icons = TreeIcons.new.extract_icons(tree)
    js = "Docs.classData = " + JSON.generate( tree ) + ";"
    js += "Docs.icons = " + JSON.generate( icons ) + ";"
    File.open(filename, 'w') {|f| f.write(js) }
  end

  # Writes documentation page for each class
  def self.write_pages(path, docs, verbose)
    docs.each do |cls|
      filename = path + "/" + cls[:name] + ".html"
      puts "Writing to #{filename} ..." if verbose
      File.open(filename, 'w') {|f| f.write( Page.new(cls).to_html ) }
    end
  end

  def self.copy_template(template_dir, dir, verbose)
    puts "Copying template files to #{dir}..." if verbose
    if File.exists?(dir)
      FileUtils.rm_r(dir)
    end
    FileUtils.cp_r(template_dir, dir)
    FileUtils.mkdir(dir + "/output")
  end
end


if __FILE__ == $0 then
  output_dir = nil
  template_dir = File.dirname(File.dirname(__FILE__)) + "/template"
  verbose = false

  opts = OptionParser.new do | opts |
    opts.banner = "Usage: ruby jsduck.rb [options] files..."

    opts.on('-o', '--output=PATH', "Directory to output all this amazing documentation.") do |path|
      output_dir = path
    end

    opts.on('-t', '--template=PATH', "Directory containing doc-browser UI template.") do |path|
      template_dir = path
    end

    opts.on('-v', '--verbose', "This will fill up your console.") do
      verbose = true
    end

    opts.on('-h', '--help', "Prints this help message") do
      puts opts
      exit
    end
  end

  input_files = opts.parse!(ARGV)

  if input_files.length == 0
    puts "You should specify some input files, otherwise there's nothing I can do :("
    exit(1)
  elsif !output_dir
    puts "You should also specify an output directory, where I could write all this amazing documentation."
    exit(1)
  elsif File.exists?(output_dir) && !File.directory?(output_dir)
    puts "Oh noes!  The output directory is not really a directory at all :("
    exit(1)
  elsif !File.exists?(File.dirname(output_dir))
    puts "Oh noes!  The parent directory for #{output_dir} doesn't exist."
    exit(1)
  end

  classes = JsDuck.filter_classes(JsDuck.parse_files(input_files, verbose))
  JsDuck.copy_template(template_dir, output_dir, verbose)
  JsDuck.write_tree(output_dir+"/output/tree.js", classes)
  JsDuck.write_pages(output_dir+"/output", classes, verbose)
end

