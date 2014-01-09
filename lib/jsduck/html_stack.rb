require 'jsduck/logger'

module JsDuck

  # Tracks opening and closing of HTML tags, with the purpose of
  # closing down the unfinished tags.
  #
  # Synopsis:
  #
  #     tags = HtmlStack.new
  #     # open and close a bunch of tags
  #     tags.open("a")
  #     tags.open("b")
  #     tags.close("b")
  #
  #     # ask which tags still need to be closed
  #     tags.close_unfinished --> "</a>"
  #
  class HtmlStack

    # Initializes the stack with two optional parameters:
    #
    # @param ignore_html A hash of additional HTML tags that don't need closing.
    # @param doc_context Filename and linenr of the current doc-comment.
    def initialize(ignore_html={}, doc_context={})
      @ignore_html = ignore_html
      @doc_context = doc_context
      @open_tags = []
    end

    # Registers opening of a tag.  Returns the tag.
    def open(tag)
      @open_tags.unshift(tag) unless void?(tag)
      tag
    end

    # Registers closing of a tag.  Returns the tag.
    def close(tag)
      if @open_tags.include?(tag)
        # delete the most recent unclosed tag in our tags stack
        @open_tags.delete_at(@open_tags.index(tag))
      end
      tag
    end

    # True when the tag is currently open.
    def open?(tag)
      @open_tags.include?(tag)
    end

    # Returns HTML for closing the still open tags.
    # Also prints warnings for all the unclosed tags.
    def close_unfinished
      return "" if @open_tags.length == 0

      warn_unfinished

      @open_tags.map {|tag| "</#{tag}>" }.join
    end

    private

    def warn_unfinished
      ctx = @doc_context
      tag_list = @open_tags.map {|tag| "<#{tag}>" }.join(", ")
      Logger.warn(:html, "Unclosed HTML tag: #{tag_list}", ctx[:filename], ctx[:linenr])
    end

    def void?(tag)
      VOID_TAGS[tag] || @ignore_html[tag]
    end

    # Tags that don't require closing
    VOID_TAGS = {
      "base" => true,
      "link" => true,
      "meta" => true,
      "hr" => true,
      "br" => true,
      "wbr" => true,
      "area" => true,
      "img" => true,
      "param" => true,
      "input" => true,
      "isindex" => true,
      "option" => true,
    }

  end

end
