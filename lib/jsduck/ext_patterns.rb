module JsDuck

  # Identifies Ext JS builtins like Ext.define and Ext.extend, taking
  # also into account the possibility of aliasing the Ext namespace.
  #
  # For example when the following command line option is used:
  #
  #     --ext-namespaces=Ext,MyApp
  #
  # we need to identify both Ext.define and MyApp.define, but
  # Ext.define is additionally aliased withing ExtJS as
  # Ext.ClassManager.create, so we also need to recognize
  # Ext.ClassManager.create and MyApp.ClassManager.create.
  #
  # The matches? method will take care of identifying all these four
  # cases:
  #
  #     ps = ExtPatterns.new(["Ext", "MyApp"])
  #     matches?("Ext.define", "MyApp.define") --> true
  #
  class ExtPatterns
    def initialize(namespaces)
      @patterns = {
        "Ext.define" => build_patterns(namespaces, [".define", ".ClassManager.create"]),
        "Ext.extend" => build_patterns(namespaces, [".extend"]),
        "Ext.override" => build_patterns(namespaces, [".override"]),
        "Ext.emptyFn" => build_patterns(namespaces, [".emptyFn"]),
      }
    end

    # True when string matches the given pattern type.
    #
    # Pattern type is one of: "Ext.define", "Ext.extend",
    # "Ext.override", "Ext.emptyFn"
    def matches?(pattern, string)
      @patterns[pattern].include?(string)
    end

    private

    # Given Array of alternate Ext namespaces builds list of patterns
    # for detecting Ext.define or some other construct:
    #
    # build_patterns(["Ext", "Foo"], [".define"]) --> ["Ext.define", "Foo.define"]
    #
    def build_patterns(namespaces, suffixes)
      patterns = []
      namespaces.each do |ns|
        suffixes.each do |suffix|
          patterns << ns + suffix
        end
      end
      patterns
    end

  end

end
