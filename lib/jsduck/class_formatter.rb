require 'jsduck/type_parser'
require 'jsduck/logger'
require 'jsduck/meta_tag_registry'

module JsDuck

  # Converts :doc properties of class from markdown to HTML, resolves
  # @links, and converts type definitions to HTML.
  class ClassFormatter
    # Set to false to disable HTML-formatting of type definitions.
    attr_accessor :include_types

    def initialize(relations, formatter)
      @relations = relations
      @formatter = formatter
      # inject formatter to all meta-tags
      MetaTagRegistry.instance.formatter = formatter
      @include_types = true
    end

    # Runs the formatter on doc object of a class.
    # Accessed using Class#internal_doc
    def format(cls)
      @cls = cls
      @formatter.class_context = cls[:name]
      @formatter.doc_context = cls[:files][0]
      cls[:doc] = @formatter.format(cls[:doc]) if cls[:doc]
      [:members, :statics].each do |group|
        cls[group].each_pair do |type, members|
          # format all members (except hidden ones)
          cls[group][type] = members.map {|m| m[:meta][:hide] ? m : format_member(m)  }
        end
      end
      cls[:html_meta] = format_meta_data(cls)
      cls
    end

    def format_member(m)
      @formatter.doc_context = m[:files][0]
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
      if expandable?(m) || @formatter.too_long?(m[:doc])
        m[:shortDoc] = @formatter.shorten(m[:doc])
      end

      # We don't validate and format CSS var and mixin type definitions
      is_css_tag = m[:tagname] == :css_var || m[:tagname] == :css_mixin

      m[:html_type] = (@include_types && !is_css_tag) ? format_type(m[:type]) : m[:type] if m[:type]
      m[:params] = m[:params].map {|p| format_item(p, is_css_tag) } if m[:params]
      m[:response] = m[:response].map {|r| format_item(r, is_css_tag) } if m[:response]
      m[:return] = format_item(m[:return], is_css_tag) if m[:return]
      m[:throws] = m[:throws].map {|t| format_item(t, is_css_tag) } if m[:throws]
      m[:properties] = m[:properties].map {|b| format_item(b, is_css_tag) } if m[:properties]
      m[:examples] = m[:examples].map {|b| format_item(b, is_css_tag) } if m[:examples]
      m[:html_meta] = format_meta_data(m)
      m[:default] = @formatter.replace(m[:default]) if m[:default]
      m
    end

    def expandable?(m)
      m[:params] || (m[:properties] && m[:properties].length > 0) || m[:default] || m[:meta][:deprecated] || m[:meta][:template]
    end

    def format_item(it, is_css_tag)
      it[:doc] = @formatter.format(it[:doc]) if it[:doc]
      it[:html_type] = (@include_types && !is_css_tag) ? format_type(it[:type]) : it[:type] if it[:type]
      it[:properties] = it[:properties].map {|s| format_item(s, is_css_tag) } if it[:properties]
      it[:default] = @formatter.replace(it[:default]) if it[:default]
      it
    end

    def format_type(type)
      tp = TypeParser.new(@relations, @formatter)
      if tp.parse(type)
        tp.out
      else
        context = @formatter.doc_context
        if tp.error == :syntax
          Logger.instance.warn(:type_syntax, "Incorrect type syntax #{type}", context[:filename], context[:linenr])
        else
          Logger.instance.warn(:type_name, "Unknown type #{type}", context[:filename], context[:linenr])
        end
        type
      end
    end

    def format_meta_data(context)
      result = {}
      context[:meta].each_pair do |key, value|
        if value
          tag = MetaTagRegistry.instance[key]
          tag.context = context
          result[key] = tag.to_html(value)
        end
      end
      result
    end

  end

end
