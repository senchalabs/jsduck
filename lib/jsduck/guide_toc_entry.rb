require 'jsduck/util/html'

module JsDuck

  # Manages the single TOC entry (with possible subentries).
  class GuideTocEntry
    attr_accessor :label, :items

    def initialize(parent=nil)
      @parent = parent
      @label = ""
      @items = []
      @min_level = 2
    end

    # Adds entry at the corresponding heading level.
    def add(level, id, text)
      if level == @min_level
        @items << GuideTocEntry.new(self)
        @items.last.label = "#{prefix} <a href='#!/guide/#{id}'>#{text}</a>\n"
      else
        if @items.empty?
          @items << GuideTocEntry.new(self)
        end
        @items.last.add(level-1, id, text)
      end
    end

    # Generates the heading counter, like "1.5.4."
    def prefix
      (@parent ? @parent.prefix : "") + "#{@items.length}."
    end

    # Total number of headings in TOC
    def count
      @items.map {|item| 1 + item.count}.reduce(0, :+)
    end

    # Converts to nested HTML list.
    def to_html
      return if @items.empty?

      return [
        "<ul>",
          @items.map do |item|
            "<li>#{item.label} #{item.to_html}</li>"
          end,
        "</ul>",
      ].flatten.compact.join("\n")
    end

  end

end
