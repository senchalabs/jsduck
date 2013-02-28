require 'jsduck/tag_registry'
require 'jsduck/util/md5'

module JsDuck
  module Web

    # Writes the CSS gathered from Tag classes into given file.
    # Then Renames the file so it contains an MD5 hash inside it,
    # returning the resulting fingerprinted name.
    class Css
      def write(filename)
        File.open(filename, 'w') {|f| f.write(TagRegistry.css) }
        Util::MD5.rename(filename)
      end
    end

  end
end
