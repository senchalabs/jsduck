require 'parallel'

module JsDuck

  # Wrapper around the parallel gem that falls back to simple
  # Array#map and Array#each when :in_processes => 0 specified.
  class ParallelWrap

    # Takes config object for parallel
    def initialize(cfg = {})
      @cfg = cfg
    end

    def each(arr, &block)
      if @cfg[:in_processes] == 0
        arr.each &block
      else
        Parallel.each(arr, @cfg, &block)
      end
    end

    def map(arr, &block)
      if @cfg[:in_processes] == 0
        arr.map &block
      else
        Parallel.map(arr, @cfg, &block)
      end
    end
  end

end
