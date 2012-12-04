module JsDuck

  # Handles patterns of external classes.
  #
  # A pattern can be a simple classname or a one with a wildcard "*".
  class ExternalClasses

    def initialize(classnames = [])
      @class_names = {}
      @patterns = []
      classnames.each do |name|
        if name =~ /\*/
          @patterns << make_pattern(name)
        else
          @class_names[name] = true
        end
      end
    end

    # True if the classname matches an external class pattern.
    def is?(classname)
      @class_names[classname] || @patterns.any? {|p| classname =~ p }
    end

    def make_pattern(pattern)
      Regexp.new("^" + pattern.split(/\*/, -1).map {|s| Regexp.escape(s) }.join(".*") + "$")
    end
  end

end
