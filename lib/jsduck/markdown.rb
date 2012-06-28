
module JsDuck

  # Wrapper which chooses the available Markdown implementation and
  # provides a uniform interface to it.
  #
  # Possible engines in order of preference:
  #
  # - rdiscount
  # - kramdown
  #
  class Markdown

    if RUBY_PLATFORM == "java"
      require "kramdown"
      begin
        @@engine = :kramdown
      rescue LoadError
        throw "ERROR: Kramdown gem not available."
      end
    else
      begin
        require "rdiscount"
        @@engine = :rdiscount
      rescue LoadError
        begin
          require "kramdown"
          @@engine = :kramdown
        rescue LoadError
          throw "ERROR: Neither RDiscount nor Kramdown gem available."
        end
      end
    end

    # Converts Markdown text into HTML
    def self.to_html(input)
      if @@engine == :rdiscount
        RDiscount.new(input).to_html
      else
        Kramdown::Document.new(input).to_html
      end
    end

  end

end
