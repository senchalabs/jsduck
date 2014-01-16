module JsDuck

  # Splits array of items with subitems into roughly equal size groups.
  class Columns
    # Initialized with the name of subitems field.
    def initialize(subitems_field)
      @header_size = 3
      @subitems_field = subitems_field
    end

    # Splits the array of items into n chunks so that the sum of
    # largest chunk is as small as possible.
    #
    # This is a brute-force implementation - we just try all the
    # combinations and choose the best one.
    def split(items, n)
      if n == 1
        [items]
      elsif items.length <= n
        Array.new(n) {|i| items[i] ? [items[i]] : [] }
      else
        min_max = nil
        min_arr = nil
        i = 0
        while i <= items.length-n
          i += 1
          # Try placing 1, 2, 3, ... items to first chunk.
          # Calculate the remaining chunks recursively.
          cols = [items[0,i]] + split(items[i, items.length], n-1)
          max = max_sum(cols)
          # Is this the optimal solution so far? Remember it.
          if !min_max || max < min_max
            min_max = max
            min_arr = cols
          end
        end
        min_arr
      end
    end

    private

    def max_sum(cols)
      cols.map {|col| sum(col) }.max
    end

    # Finds the total size of items in array
    #
    # The size of one item is it's number of classes + the space for header
    def sum(arr)
      arr.reduce(0) {|sum, item| sum + item[@subitems_field].length + @header_size }
    end

  end

end
