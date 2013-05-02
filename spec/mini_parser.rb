require "jsduck/aggregator"
require "jsduck/parser"
require "jsduck/class"
require "jsduck/relations"
require "jsduck/source/file"
require "jsduck/process/ignored_classes"
require "jsduck/process/accessors"
require "jsduck/process/ext4_events"
require "jsduck/process/enums"
require "jsduck/process/overrides"
require "jsduck/process/inherit_doc"
require "jsduck/process/return_values"
require "jsduck/process/fires"

module Helper
  # Helper class for testing documentation parsing.
  #
  # Simplifies the complicated setup we need for parsing.
  #
  # Takes a source code string we want to parse and an options object.
  # Options enable conditionally additional steps in the parsing
  # process.  Additionally the options can contain :filename which
  # will be used as a filename.
  class MiniParser
    def self.parse(string, opts={})
      fname = opts[:filename] || ""
      file = JsDuck::Source::File.new(string, JsDuck::Parser.new.parse(string, fname), fname)

      agr = JsDuck::Aggregator.new
      agr.aggregate(file)
      classes_hash = agr.result

      JsDuck::Process::IgnoredClasses.new(classes_hash).process_all! if opts[:ignored_classes]
      JsDuck::Process::Accessors.new(classes_hash).process_all! if opts[:accessors]
      JsDuck::Process::Ext4Events.new(classes_hash).process_all! if opts[:ext4_events]
      JsDuck::Process::Enums.new(classes_hash).process_all! if opts[:enums]
      JsDuck::Process::Overrides.new(classes_hash).process_all! if opts[:overrides]

      relations = JsDuck::Relations.new(classes_hash.values.map {|cls| JsDuck::Class.new(cls) })

      JsDuck::Process::InheritDoc.new(relations).process_all! if opts[:inherit_doc]
      JsDuck::Process::ReturnValues.new(relations).process_all! if opts[:return_values]
      JsDuck::Process::Fires.new(relations).process_all! if opts[:fires]

      relations
    end
  end
end
