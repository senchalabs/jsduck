require 'optparse'

module JsDuck

  # JSDuck version of OptionParser
  #
  # Enhanced with ability to output options help in two ways:
  #
  # - short list of all options (with the built-in #help method)
  # - long description of one option (with the added #help_single method)
  #
  class OptionParser < ::OptionParser
    def initialize
      @full_options_index = {}
      super
    end

    # Override the #on method to do some pre-processing on its
    # parameters before passing them to the original #on method.
    #
    # Options are defined as usual:
    #
    #     opts.on("-v", "--version", Type, "First line of description.",
    #             "Second line of description.",
    #             "Third line of description.")
    #
    # But only the first line of description will be passed to
    # original #on method - meaning that #help method will also only
    # list this first line.
    #
    # The remaining lines are saved to a separate place and can be
    # retrieved through asking for full docs for an option with
    # #help_single method.
    #
    def on(*opts, &block)
      core = []
      keys = []
      desc = []

      desc_started = false
      opts.each do |o|
        if desc_started
          desc << o
        elsif String === o
          if o =~ /^-/
            core << o
            keys << o
          else
            core << o
            desc << o
            desc_started = true
          end
        else
          core << o
        end
      end

      full = {:keys => keys, :desc => desc}

      keys.each do |op|
        each_index_key(op) {|k| @full_options_index[k] = full }
      end

      super(*core, &block)
    end

    # Helper that turns option name like --images=PATH into list of
    # keys by which we index the options:
    #
    #     "--images=PATH" --> ["--images", "images"]
    #
    # For options containing "[no-]" all the alternative forms are expanded:
    #
    #     "--[no-]seo"    --> ["--[no-]seo", "[no-]seo", "--seo", "seo", "--no-seo", "no-seo"]
    #
    def each_index_key(option_name)
      key = option_name.sub(/\[?=.*/, '')
      plain_key = key.sub(/^-*/, '')
      [key, plain_key].each do |k|
        yield k
        if k =~ /\[no-\]/
          yield k.sub(/\[no-\]/, '')
          yield k.sub(/\[no-\]/, 'no-')
        end
      end
    end

    # Returns long help text for a single option.
    def help_single(option_name)
      o = @full_options_index[option_name] || {:keys => [option_name], :desc => ["No such option. See --help=help"]}

      r = []

      r << ""
      r << "    " + o[:keys].join(", ")
      r << ""

      o[:desc].each do |line|
        r << "            " + line
      end

      r << ""
      r << ""

      return r.join("\n")
    end
  end

end
