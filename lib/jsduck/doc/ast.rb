require 'jsduck/tag_registry'
require 'jsduck/doc/subproperties'
require 'jsduck/logger'

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
            :return => detect_return(doc_map),
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
            :name => detect_name(:cfg, doc_map),
            :type => detect_type(:cfg, doc_map),
            :doc => detect_doc(:cfg, doc_map),
            :default => detect_default(:cfg, doc_map),
            :properties => detect_subproperties(:cfg, docs),
          }, doc_map)
      end

      def create_property(docs, doc_map)
        return add_shared({
            :tagname => :property,
            :name => detect_name(:property, doc_map),
            :type => detect_type(:property, doc_map),
            :doc => detect_doc(:property, doc_map),
            :default => detect_default(:property, doc_map),
            :properties => detect_subproperties(:property, docs),
          }, doc_map)
      end

      def create_css_var(docs, doc_map)
        return add_shared({
            :tagname => :css_var,
            :name => detect_name(:css_var, doc_map),
            :type => detect_type(:css_var, doc_map),
            :default => detect_default(:css_var, doc_map),
            :doc => detect_doc(:css_var, doc_map),
          }, doc_map)
      end

      def create_css_mixin(docs, doc_map)
        return add_shared({
            :tagname => :css_mixin,
            :name => detect_name(:css_mixin, doc_map),
            :doc => detect_doc(:css_mixin, doc_map),
          }, doc_map)
      end

      # Detects properties common for each doc-object and adds them
      def add_shared(hash, doc_map)
        doc_map.each_pair do |key, value|
          if tag = TagRegistry.get_by_key(key)
            tag.process_doc(hash, value)
          end
        end

        hash[:required] = true if detect_required(doc_map)

        return hash
      end

      def detect_name(tagname, doc_map)
        extract(doc_map, tagname, :name)
      end

      def extract(doc_map, tagname, propname = nil)
        tag = doc_map[tagname] ? doc_map[tagname].first : nil
        if tag && propname
          tag[propname]
        else
          tag
        end
      end

      def detect_type(tagname, doc_map)
        extract(doc_map, tagname, :type) || extract(doc_map, :type, :type)
      end

      def detect_default(tagname, doc_map)
        extract(doc_map, tagname, :default)
      end

      def detect_required(doc_map)
        doc_map[:cfg] && doc_map[:cfg].first[:optional] == false
      end

      def detect_subproperties(tagname, docs)
        prop_docs = docs.find_all {|tag| tag[:tagname] == tagname}
        prop_docs.length > 0 ? nest_properties(prop_docs)[0][:properties] : []
      end

      def nest_properties(raw_items)
        items, warnings = Doc::Subproperties.nest(raw_items)
        warnings.each {|msg| Logger.warn(:subproperty, msg, @filename, @linenr) }
        items
      end

      def detect_return(doc_map)
        has_return_tag = !!extract(doc_map, :return)
        ret = extract(doc_map, :return) || {}
        return {
          :type => ret[:type] || (has_return_tag ? "Object" : "undefined"),
          :name => ret[:name] || "return",
          :doc => ret[:doc] || "",
          :properties => doc_map[:return] ? detect_subproperties(:return, doc_map[:return]) : []
        }
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
