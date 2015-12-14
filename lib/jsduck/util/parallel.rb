require 'jsduck/util/os'
require 'parallel'

module JsDuck
  module Util

    # Wrapper around the parallel gem that falls back to simple
    # Array#map and Array#each when :in_processes => 0 specified.
    class Parallel
      @@in_processes = nil

<<<<<<< HEAD
      # Sets globally the nr of processes to use.
      def self.in_processes=(n)
        # Hard code to zero to work around gem crashing
        @@in_processes = 0
=======
      # Configures the logger to use as many processes as set in
      # command line options.  When in Windows, turns the parallel
      # processing off by default.
      def self.configure(opts)
        @@in_processes = 0 if Util::OS::windows?
        @@in_processes = opts.processes if opts.processes
>>>>>>> senchalabs/master
      end

      def self.each(arr, &block)
        if @@in_processes == 0
          arr.each &block
        else
          ::Parallel.each(arr, {:in_processes => @@in_processes}, &block)
        end
      end

      def self.map(arr, &block)
        if @@in_processes == 0
          arr.map &block
        else
          ::Parallel.map(arr, {:in_processes => @@in_processes}, &block)
        end
      end
    end

  end
end
