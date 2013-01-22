require 'jsduck/tag_registry'

module JsDuck
  module Doc

    # Detects docs info directly from comment.
    class Ast
      # Allow passing in filename and line for error reporting
      attr_accessor :filename
      attr_accessor :linenr

      def initialize
        @filename = ""
        @linenr = 0
      end

      # Given tagname and array of tags from DocParser, produces docs
      # of the type determined by tagname.
      def detect(tagname, docs, doc_map)
        case tagname
        when :class
          create_class(docs, doc_map)
        when :event
          create_event(docs, doc_map)
        when :method
          create_method(docs, doc_map)
        when :cfg
          create_cfg(docs, doc_map)
        when :property
          create_property(docs, doc_map)
        when :css_var
          create_css_var(docs, doc_map)
        when :css_mixin
          create_css_mixin(docs, doc_map)
        end
      end

      private

      def create_class(docs, doc_map)
        return add_shared({
            :tagname => :class,
            :doc => detect_doc(:class, doc_map),
          }, doc_map)
      end

      def create_method(docs, doc_map)
        return add_shared({
            :tagname => :method,
            :doc => detect_doc(:method, doc_map),
          }, doc_map)
      end

      def create_event(docs, doc_map)
        return add_shared({
            :tagname => :event,
            :doc => detect_doc(:event, doc_map),
          }, doc_map)
      end

      def create_cfg(docs, doc_map)
        return add_shared({
            :tagname => :cfg,
            :doc => detect_doc(:cfg, doc_map),
          }, doc_map)
      end

      def create_property(docs, doc_map)
        return add_shared({
            :tagname => :property,
            :doc => detect_doc(:property, doc_map),
          }, doc_map)
      end

      def create_css_var(docs, doc_map)
        return add_shared({
            :tagname => :css_var,
            :doc => detect_doc(:css_var, doc_map),
          }, doc_map)
      end

      def create_css_mixin(docs, doc_map)
        return add_shared({
            :tagname => :css_mixin,
            :doc => detect_doc(:css_mixin, doc_map),
          }, doc_map)
      end

      # Detects properties common for each doc-object and adds them
      def add_shared(hash, doc_map)
        position = {:filename => @filename, :linenr => @linenr}

        doc_map.each_pair do |key, value|
          if tag = TagRegistry.get_by_key(key)
            tag.process_doc(hash, value, position)
          end
        end

        return hash
      end

      def extract(doc_map, tagname, propname = nil)
        tag = doc_map[tagname] ? doc_map[tagname].first : nil
        if tag && propname
          tag[propname]
        else
          tag
        end
      end

      # Returns documentation for class or member.
      def detect_doc(tagname, doc_map)
        doc = extract(doc_map, :doc, :doc) || ""
        if tagname == :cfg || tagname == :property
          doc += extract(doc_map, tagname, :doc) || ""
        elsif tagname == :method && doc_map[:constructor]
          doc += extract(doc_map, :constructor, :doc)
        end
        doc
      end

    end

  end
end
