require 'jsduck/logger'

module JsDuck

  # Tracks opening and closing of HTML tags, with the purpose of
  # closing down the unfinished tags.
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

    # Scans an opening tag in HTML using the passed in StringScanner.
    def open(s)
      s.scan(/</) + push_tag(s.scan(/\w+/)) + s.scan_until(/>|\Z/)
    end

    # Scans a closing tag in HTML using the passed in StringScanner.
    def close(s)
      s.scan(/<\//)
      tag = s.scan(/\w+/)
      s.scan(/>/)

      pop_tags(tag).map {|t| "</#{t}>" }.join
    end

    # Registers opening of a tag.  Returns the tag.
    def push_tag(tag)
      @open_tags.push(tag) unless void?(tag)
      tag
    end

    # True when the tag is currently open.
    def open?(tag)
      @open_tags.include?(tag)
    end

    private

    # Registers closing of a tag.  Returns all the tags that need to
    # be closed at that point.
    def pop_tags(tag)
      if !@open_tags.include?(tag)
        if @ignore_html[tag]
          return [tag]
        else
          warn_unopened(tag)
          return []
        end
      end

      popped = []
      begin
        popped << t = @open_tags.pop
        if t != tag
          warn_unclosed(t)
        end
      end until t == tag

      popped
    end

    def warn_unopened(*tags)
      warn("Unopened HTML tag", tags)
    end

    def warn_unclosed(*tags)
      warn("Unclosed HTML tag", tags)
    end

    def warn(msg, tags)
      ctx = @doc_context
      tag_list = tags.map {|tag| "<#{tag}>" }.join(", ")
      Logger.warn(:html, "#{msg}: #{tag_list}", ctx[:filename], ctx[:linenr])
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
