$:.unshift File.dirname(__FILE__) # For running the actual JsDuck app

require 'jsduck/lexer'
require 'jsduck/parser'
require 'jsduck/doc_parser'
require 'jsduck/merger'
require 'jsduck/tree'
require 'json'

require 'optparse'
require 'fileutils'
require 'pp'

module JsDuck
  def JsDuck.parse(input)
    doc_parser = DocParser.new
    merger = Merger.new
    documentation = []
    current_class = nil

    Parser.new(input).parse.each do |docset|
      node = merger.merge(doc_parser.parse(docset[:comment]), docset[:code])
      # all methods, cfgs, ... following a class will be added to that class
      if node[:tagname] == :class
        current_class = node
        documentation << node
      elsif current_class
        current_class[ node[:tagname] ] << node
      else
        documentation << node
      end
    end

    documentation
  end

  # Given array of filenames, parses all files and returns array of
  # documented items in all of those files.
  def JsDuck.parse_files(filenames, verbose)
    docs = []
    filenames.each do |name|
      puts "Parsing #{name} ..." if verbose
      JsDuck.parse(IO.read(name)).each { |d| docs << d }
    end
    docs
  end

  def JsDuck.print_debug(docs)
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
  def JsDuck.write_tree(filename, docs)
    js = "Docs.classData = " + JSON.generate( Tree.new.create(docs) ) + ";"
    File.open(filename, 'w') {|f| f.write(js) }
  end
end


if __FILE__ == $0 then
  output_dir = nil
  verbose = false

  opts = OptionParser.new do | opts |
    opts.banner = "Usage: ruby jsduck.rb [options] files..."

    opts.on('-o', '--output=PATH', "Directory to output all this amazing documentation.") do |path|
      output_dir = path
    end

    opts.on('--verbose', "This will fill up your console.") do
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
  elsif !File.exists?(output_dir)
    puts "Output directory doesn't exist.  I'll take the pride of creating it..."
    FileUtils.mkdir(output_dir)
  elsif !File.directory?(output_dir)
    puts "Oh noes!  The output directory is not really a directory at all :("
    exit(1)
  end

  docs = JsDuck.parse_files(input_files, verbose)
  JsDuck.write_tree(output_dir+"/tree.js", docs)
end

