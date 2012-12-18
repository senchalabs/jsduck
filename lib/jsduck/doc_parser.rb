require 'strscan'
require 'jsduck/doc_comment'
require 'jsduck/doc_scanner'
require 'jsduck/builtins_registry'
require 'jsduck/meta_tag_registry'
require 'jsduck/logger'

module JsDuck

  # Parses doc-comment into array of @tags
  #
  # For each @tag it produces Hash like the following:
  #
  #     {
  #       :tagname => :cfg/:property/:type/:extends/...,
  #       :doc => "Some documentation for this tag",
  #       ...@tag specific stuff like :name, :type, and so on...
  #     }
  #
  # When doc-comment begins with comment, not preceded by @tag, then
  # the comment will be placed into Hash with :tagname => :default.
  #
  # Unrecognized @tags are left as is into documentation as if they
  # were normal text.
  #
  # @example, {@img}, {@link} and {@video} are parsed separately in
  # JsDuck::DocFormatter.
  #
  class DocParser < DocScanner
    def initialize
      super
      @builtins = BuiltinsRegistry
      @meta_tags = MetaTagRegistry.instance
    end

    def parse(input, filename="", linenr=0)
      @filename = filename
      @linenr = linenr
      @tags = []
      @input = StringScanner.new(DocComment.purify(input))

      parse_loop

      clean_empty_docs
      clean_empty_default_tag
      @tags
    end

    # The parsing process can leave whitespace at the ends of
    # doc-strings, here we get rid of it.
    # Additionally null all empty docs.
    def clean_empty_docs
      @tags.each do |tag|
        tag[:doc].strip!
        tag[:doc] = nil if tag[:doc] == ""
      end
    end

    # Gets rid of empty default tag
    def clean_empty_default_tag
      if @tags.first && @tags.first[:tagname] == :default && !@tags.first[:doc]
        @tags.shift
      end
    end

    # The main loop of the DocParser
    def parse_loop
      add_tag(:default)

      while !@input.eos? do
        if look(/@/)
          parse_at_tag
        elsif look(/[^@]/)
          skip_to_next_at_tag
        end
      end
    end

    # Processes anything beginning with @-sign.
    #
    # - When @ is not followed by any word chars, do nothing.
    # - When it's one of the builtin tags, process it as such.
    # - When it's one of the meta-tags, process it as such.
    # - When it's something else, print a warning.
    #
    def parse_at_tag
      match(/@/)
      name = look(/\w+/)

      if !name
        # ignore
      elsif tag = @builtins.get_tag(name)
        match(/\w+/)
        tag.parse(self)
        skip_white
      elsif tagdef = @meta_tags[name]
        match(/\w+/)
        parse_meta_tag(tagdef)
      else
        Logger.warn(:tag, "Unsupported tag: @#{name}", @filename, @linenr)
        @current_tag[:doc] += "@"
      end
    end

    # Matches the given meta-tag
    def parse_meta_tag(tag)
      prev_tag = @current_tag

      add_tag(:meta)
      @current_tag[:name] = tag.key
      skip_horiz_white

      if tag.boolean
        # For boolean tags, only scan the tag name and switch context
        # back to previous tag.
        skip_white
        @current_tag = prev_tag
      elsif tag.multiline
        # For multiline tags we leave the tag open for :doc addition
        # just like with built-in multiline tags.
      else
        # Fors singleline tags, scan to the end of line and finish the
        # tag.
        @current_tag[:doc] = match(/.*$/).strip
        skip_white
        @current_tag = prev_tag
      end
    end

    # Skips until the beginning of next @tag.
    #
    # There must be space before the next @tag - this ensures that we
    # don't detect tags inside "foo@example.com" or "{@link}".
    #
    # Also check that the @tag is not part of an indented code block -
    # in which case we also ignore the tag.
    def skip_to_next_at_tag
      @current_tag[:doc] += match(/[^@]+/)

      while look(/@/) && (!prev_char_is_whitespace? || indented_as_code?)
        @current_tag[:doc] += match(/@+[^@]+/)
      end
    end

    def prev_char_is_whitespace?
      @current_tag[:doc][-1,1] =~ /\s/
    end

    def indented_as_code?
      @current_tag[:doc] =~ /^ {4,}[^\n]*\Z/
    end
  end

end
