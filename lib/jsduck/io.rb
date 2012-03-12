module JsDuck

  # A helper to use instead the builtin IO class to read files in
  # correct encoding.
  #
  # By default in Ruby 1.9 the encoding is auto-detected, which can
  # have surprising results.  So in here we force all files to be
  # treated as UTF-8.
  class IO

    # Reads given filename into string
    def self.read(filename)
      File.open(filename, "r:UTF-8") {|f| f.read }
    end

  end

end
