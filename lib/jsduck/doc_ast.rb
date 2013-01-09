require 'jsduck/tag_registry'
require 'jsduck/subproperties'

module JsDuck

  # Detects docs info directly from comment.
  class DocAst
    # Allow passing in filename and line for error reporting
    attr_accessor :filename
    attr_accessor :linenr

    def initialize
      @filename = ""
      @linenr = 0
    end

    # Given tagname and array of tags from DocParser, produces docs
    # of the type determined by tagname.
    def detect(tagname, docs)
      case tagname
      when :class
        create_class(docs)
      when :event
        create_event(docs)
      when :method
        create_method(docs)
      when :cfg
        create_cfg(docs)
      when :property
        create_property(docs)
      when :css_var
        create_css_var(docs)
      when :css_mixin
        create_css_mixin(docs)
      end
    end

    private

    def create_class(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :class,
        :name => detect_name(:class, doc_map),
        :doc => detect_doc(docs),
        :enum => detect_enum(doc_map),
        :override => extract(doc_map, :override, :class),
      }, doc_map)
    end

    def create_method(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :method,
        :name => detect_name(:method, doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
        :return => detect_return(doc_map),
      }, doc_map)
    end

    def create_event(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :event,
        :name => detect_name(:event, doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
      }, doc_map)
    end

    def create_cfg(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :cfg,
        :name => detect_name(:cfg, doc_map),
        :type => detect_type(:cfg, doc_map),
        :doc => detect_doc(docs),
        :default => detect_default(:cfg, doc_map),
        :properties => detect_subproperties(:cfg, docs),
      }, doc_map)
    end

    def create_property(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :property,
        :name => detect_name(:property, doc_map),
        :type => detect_type(:property, doc_map),
        :doc => detect_doc(docs),
        :default => detect_default(:property, doc_map),
        :properties => detect_subproperties(:property, docs),
      }, doc_map)
    end

    def create_css_var(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :css_var,
        :name => detect_name(:css_var, doc_map),
        :type => detect_type(:css_var, doc_map),
        :default => detect_default(:css_var, doc_map),
        :doc => detect_doc(docs),
      }, doc_map)
    end

    def create_css_mixin(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :css_mixin,
        :name => detect_name(:css_mixin, doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
      }, doc_map)
    end

    # Detects properties common for each doc-object and adds them
    def add_shared(hash, doc_map)
      doc_map.each_pair do |key, value|
        if tag = TagRegistry.get_by_key(key)
          hash[key] = tag.process_doc(value)
        end
      end

      hash[:required] = true if detect_required(doc_map)

      return hash
    end

    def detect_name(tagname, doc_map)
      name = extract(doc_map, tagname, :name)
      if name
        name
      else
        doc_map[:constructor] ? "constructor" : nil
      end
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

    def detect_params(doc_map)
      nest_properties(doc_map[:param] || [])
    end

    def detect_subproperties(tagname, docs)
      prop_docs = docs.find_all {|tag| tag[:tagname] == tagname}
      prop_docs.length > 0 ? nest_properties(prop_docs)[0][:properties] : []
    end

    def nest_properties(raw_items)
      Subproperties.nest(raw_items, @filename, @linenr)
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

    def detect_enum(doc_map)
      return nil unless extract(doc_map, :class, :enum)

      default = extract(doc_map, :class, :default)

      return {
        :type => extract(doc_map, :class, :type),
        :default => default,
        :doc_only => !!default,
      }
    end

    # Combines :doc-s of most tags
    # Ignores tags that have doc comment themselves and subproperty tags
    def detect_doc(docs)
      ignore_tags = [:param, :return] + TagRegistry.multiliners.map {|t| t.key }
      doc_tags = docs.find_all { |tag| !ignore_tags.include?(tag[:tagname]) && !subproperty?(tag) }
      doc_tags.map { |tag| tag[:doc] }.compact.join(" ")
    end

    def subproperty?(tag)
      (tag[:tagname] == :cfg || tag[:tagname] == :property) && tag[:name] =~ /\./
    end

    # Build map of at-tags for quick lookup
    def build_doc_map(docs)
      map = {}
      docs.each do |tag|
        if map[tag[:tagname]]
          map[tag[:tagname]] << tag
        else
          map[tag[:tagname]] = [tag]
        end
      end
      map
    end
  end

end
