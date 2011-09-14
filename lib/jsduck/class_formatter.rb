require 'jsduck/type_parser'
require 'jsduck/logger'

module JsDuck

  # Converts :doc properties of class from markdown to HTML, resolves
  # @links, and converts type definitions to HTML.  Also removes
  # private members.
  class ClassFormatter
    # Set to false to disable HTML-formatting of type definitions.
    attr_accessor :include_types

    def initialize(relations, formatter)
      @relations = relations
      @formatter = formatter
      @include_types = true
    end

    # Runs the formatter on doc object of a class.
    # Accessed using Class#internal_doc
    def format(cls)
      @cls = cls
      @formatter.class_context = cls[:name]
      @formatter.doc_context = cls
      cls[:doc] = @formatter.format(cls[:doc]) if cls[:doc]
      cls[:members].each_pair do |type, members|
        cls[:members][type] = members.reject {|m| m[:private] }.map {|m| format_member(m) }
      end
      cls[:statics].each_pair do |type, members|
        cls[:statics][type] = members.reject {|m| m[:private] }.map {|m| format_member(m) }
      end
      cls
    end

    def format_member(m)
      @formatter.doc_context = m
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
      m[:deprecated][:text] = @formatter.format(m[:deprecated][:text]) if m[:deprecated]
      if expandable?(m) || @formatter.too_long?(m[:doc])
        m[:shortDoc] = @formatter.shorten(m[:doc])
      end

      # We don't validate and format CSS var and mixin type definitions
      is_css_tag = m[:tagname] == :css_var || m[:tagname] == :css_mixin

      m[:html_type] = (@include_types && !is_css_tag) ? format_type(m[:type]) : m[:type] if m[:type]
      m[:params] = m[:params].map {|p| format_item(p, is_css_tag) } if m[:params]
      m[:return] = format_item(m[:return], is_css_tag) if m[:return]
      m[:properties] = m[:properties].map {|b| format_item(b, is_css_tag) } if m[:properties]
      m
    end

    def expandable?(m)
      m[:params] || (m[:properties] && m[:properties].length > 0) || m[:default] || m[:deprecated]
    end

    def format_item(it, is_css_tag)
      it[:doc] = @formatter.format(it[:doc]) if it[:doc]
      it[:html_type] = (@include_types && !is_css_tag) ? format_type(it[:type]) : it[:type] if it[:type]
      it[:properties] = it[:properties].map {|s| format_item(s, is_css_tag) } if it[:properties]
      it
    end

    def format_type(type)
      tp = TypeParser.new(@relations, @formatter)
      if tp.parse(type)
        tp.out
      else
        context = @formatter.doc_context
        if tp.error == :syntax
          Logger.instance.warn("Incorrect type syntax #{type} in #{context[:filename]} line #{context[:linenr]}")
        else
          Logger.instance.warn("Unknown type #{type} in #{context[:filename]} line #{context[:linenr]}")
        end
        type
      end
    end

  end

end
