require 'jsduck/util/json'
require 'singleton'

module JsDuck
  module Util

    # Central place for buffering JSON data that's meant to be written to STDOUT
    class Stdout
      include Singleton

      def initialize
        @data = nil
      end

      # Adds array of new data
      def add(data)
        if @data
          @data += data
        else
          @data = data
        end
      end

      # Writes data to STDOUT in JSON format,
      # but only if some data was added.
      def flush
        puts Util::Json.generate(@data) if @data
      end

    end

  end
end
