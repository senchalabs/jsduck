require 'yaml'
require 'jsduck/util/singleton'

module JsDuck

  # Locale converter of JsDuck
  class Locale
    include Util::Singleton

    # You should change this if change the locale.
    @@locale = ''  # e.g.) ja

    def initialize
      # Gets locale config from locale.yml
      config = YAML.load_file(File.expand_path(File.dirname(__FILE__)) + "/../../config/locale.yml")

      # Sets config by target locale.
      @config = config[@@locale] || Hash.new
    end

    # Returns the value of locale config.
    # If doesn't find any value, returns key character.
    def get(key)
      return @config[key] || key
    end

  end

end
