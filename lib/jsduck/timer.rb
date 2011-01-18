module JsDuck

  # Helper for timing execution of named code blocks.
  #
  #     timer = Timer.new
  #     a = timer.time(:sum) { 5 + 5 }
  #     b = timer.time(:sum) { 5 + 5 }
  #     c = timer.time(:mult) { 5 * 5 }
  #     d = timer.time(:mult) { 5 * 5 }
  #     timer.report
  #
  # The #report method will print sum of the time spent in each
  # category.
  #
  class Timer
    def initialize
      @timings = {}
    end

    # Performs timing of one code block.
    # Returns the same value that code block returns.
    def time(name)
      begin_time = Time.now
      result = yield
      interval = Time.now - begin_time
      if @timings[name]
        @timings[name] += interval
      else
        @timings[name] = interval
      end
      result
    end

    # prints timings report to console
    def report
      @timings.each {|name, time| puts "#{name}:\t#{time} seconds" }
    end
  end

end
