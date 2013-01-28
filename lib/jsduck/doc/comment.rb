module JsDuck
  module Doc

    # A simple helper to extract doc comment contents.
    class Comment

      # Extracts content inside /** ... */
      def self.purify(input)
        result = []

        # We can have two types of lines:
        # - those beginning with *
        # - and those without it
        indent = nil
        input.each_line do |line|
          line.chomp!
          if line =~ /\A\s*\*\s?(.*)\z/
            # When comment contains *-lines, switch indent-trimming off
            indent = 0
            result << $1
          elsif line =~ /\A\s*\z/
            # pass-through empty lines
            result << line
          elsif indent == nil && line =~ /\A(\s*)(.*?\z)/
            # When indent not measured, measure it and remember
            indent = $1.length
            result << $2
          else
            # Trim away indent if available
            result << line.sub(/\A\s{0,#{indent||0}}/, "")
          end
        end

        result.join("\n")
      end

    end

  end
end
