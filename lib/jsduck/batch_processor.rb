require 'jsduck/aggregator'
require 'jsduck/class'
require 'jsduck/relations'
require 'jsduck/logger'
require 'jsduck/util/singleton'
require 'jsduck/process/ignored_classes'
require 'jsduck/process/global_members'
require 'jsduck/process/enums'
require 'jsduck/process/accessors'
require 'jsduck/process/ext4_events'
require 'jsduck/process/overrides'
require 'jsduck/process/inherit_doc'
require 'jsduck/process/versions'
require 'jsduck/process/return_values'
require 'jsduck/process/fires'
require 'jsduck/process/lint'
require 'jsduck/process/circular_deps'

module JsDuck

  # Processes the parsing results into Relations object.
  class BatchProcessor
    include Util::Singleton

    # Processes array of Source::File objects from BatchParser and
    # returns instance of Relations class.
    def process(parsed_files, opts)
      r = aggregate(parsed_files)
      r = pre_process(r, opts)
      r = to_class_objects(r, opts)
      return post_process(r, opts)
    end

    private

    # Aggregates parsing results sequencially
    def aggregate(parsed_files)
      agr = Aggregator.new
      parsed_files.each do |file|
        Logger.log("Aggregating", file.filename)
        agr.aggregate(file)
      end
      agr.result
    end

    # Do all kinds of processing on the classes hash before turning it
    # into Relations object.
    def pre_process(classes_hash, opts)
      Process::IgnoredClasses.new(classes_hash).process_all!
      Process::GlobalMembers.new(classes_hash, opts).process_all!
      Process::Accessors.new(classes_hash).process_all!
      Process::Ext4Events.new(classes_hash, opts).process_all!
      Process::Enums.new(classes_hash).process_all!
      Process::Overrides.new(classes_hash, opts).process_all!

      classes_hash.values
    end

    # Turns all aggregated data into Class objects and places the
    # classes inside Relations container.
    def to_class_objects(docs, opts)
      classes = docs.map {|d| Class.new(d) }
      Relations.new(classes, opts.external_classes)
    end

    # Do all kinds of post-processing on Relations object.
    def post_process(relations, opts)
      Process::CircularDeps.new(relations).process_all!
      Process::InheritDoc.new(relations).process_all!
      Process::Versions.new(relations, opts).process_all!
      Process::ReturnValues.new(relations).process_all!
      Process::Fires.new(relations).process_all!
      Process::Lint.new(relations).process_all!
      relations
    end

  end

end
