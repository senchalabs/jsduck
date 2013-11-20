require 'jsduck/class'
require 'jsduck/member_registry'

module JsDuck
  module Exporter

    # Exporter for all the class docs.
    class Full
      def initialize(relations, opts={})
        # parameters are just for compatibility with other exporters
      end

      # Returns a hash of class data, with :members field expanded
      # into list of all members (including those inherited from
      # parents and mixins).
      def export(cls)
        # Make copy of the internal data structure of a class
        # so our modifications on it will be safe.
        h = cls.internal_doc.clone

        h[:members] = export_members(cls)

        h
      end

      private

      # Generates flat list of all members
      def export_members(cls)
        groups = []
        MemberRegistry.names.each do |tagname|
          groups << export_members_group(cls, {:tagname => tagname, :static => false})
          groups << export_members_group(cls, {:tagname => tagname, :static => true})
        end
        groups.flatten
      end

      # Looks up members of given type, and sorts them so that
      # constructor method is first
      def export_members_group(cls, cfg)
        ms = cls.find_members(cfg)
        ms.sort! {|a,b| a[:name] <=> b[:name] }
        cfg[:tagname] == :method ? constructor_first(ms) : ms
      end

      # If methods list contains constructor, move it into the beginning.
      def constructor_first(ms)
        constr = ms.find {|m| JsDuck::Class.constructor?(m) }
        if constr
          ms.delete(constr)
          ms.unshift(constr)
        end
        ms
      end

    end

  end
end
