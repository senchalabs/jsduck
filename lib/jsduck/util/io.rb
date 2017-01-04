module JsDuck
  module Util

    # A helper to use instead the builtin IO class to read files in
    # correct encoding.
    #
    # By default in Ruby 1.9 the encoding is auto-detected, which can
    # have surprising results.  So in here we read in all files in UTF-8
    # (the default) or in some other encoding specified through --encoding
    # option and convert it to UTF-8 internally.
    class IO
      @@encoding = "UTF-8"

      # Sets the external encoding to be used for reading files.
      # When it's different from UTF-8, the input will be converted to UTF-8.
      def self.encoding=(e)
        if e =~ /^UTF-8$/i
          @@encoding = e
        else
          @@encoding = e+":UTF-8"
        end
      end

      # Reads given filename into string
      def self.read(filename)
        File.open(filename, "r:"+@@encoding) {|f| f.read }
      end

    end

  end
end
