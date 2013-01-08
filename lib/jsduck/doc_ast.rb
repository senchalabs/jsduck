require 'jsduck/logger'
require 'jsduck/meta_tag_registry'

module JsDuck

  # Detects docs info directly from comment.
  class DocAst
    # Allow passing in filename and line for error reporting
    attr_accessor :filename
    attr_accessor :linenr

    def initialize
      @filename = ""
      @linenr = 0
      @meta_tags = MetaTagRegistry.instance
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
        :extends => detect_extends(doc_map),
        :mixins => detect_list(:mixins, doc_map),
        :alternateClassNames => detect_list(:alternateClassNames, doc_map),
        :aliases => detect_aliases(doc_map),
        :singleton => !!doc_map[:singleton],
        :requires => detect_list(:requires, doc_map),
        :uses => detect_list(:uses, doc_map),
        :enum => detect_enum(doc_map),
        :override => extract(doc_map, :override, :class),
      }, doc_map)
    end

    def create_method(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :method,
        :name => detect_name(:method, doc_map),
        :owner => detect_owner(doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
        :return => detect_return(doc_map),
        :throws => detect_throws(doc_map),
      }, doc_map)
    end

    def create_event(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :event,
        :name => detect_name(:event, doc_map),
        :owner => detect_owner(doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
      }, doc_map)
    end

    def create_cfg(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :cfg,
        :name => detect_name(:cfg, doc_map),
        :owner => detect_owner(doc_map),
        :type => detect_type(:cfg, doc_map),
        :doc => detect_doc(docs),
        :default => detect_default(:cfg, doc_map),
        :properties => detect_subproperties(:cfg, docs),
        :accessor => !!doc_map[:accessor],
        :evented => !!doc_map[:evented],
      }, doc_map)
    end

    def create_property(docs)
      doc_map = build_doc_map(docs)
      return add_shared({
        :tagname => :property,
        :name => detect_name(:property, doc_map),
        :owner => detect_owner(doc_map),
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
        :owner => detect_owner(doc_map),
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
        :owner => detect_owner(doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(doc_map),
      }, doc_map)
    end

    # Detects properties common for each doc-object and adds them
    def add_shared(hash, doc_map)
      hash.merge!({
        :inheritable => !!doc_map[:inheritable],
        :inheritdoc => extract(doc_map, :inheritdoc),
        :meta => detect_meta(doc_map),
      })

      # copy :private also to main hash
      hash[:private] = hash[:meta][:private] ? true : nil

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

    def detect_owner(doc_map)
      extract(doc_map, :member, :member)
    end

    def detect_type(tagname, doc_map)
      extract(doc_map, tagname, :type) || extract(doc_map, :type, :type)
    end

    def detect_extends(doc_map)
      extract(doc_map, :extends, :extends)
    end

    def detect_default(tagname, doc_map)
      extract(doc_map, tagname, :default)
    end

    # for detecting mixins and alternateClassNames
    def detect_list(type, doc_map)
      if doc_map[type]
        doc_map[type].map {|d| d[type] }.flatten
      else
        nil
      end
    end

    def detect_aliases(doc_map)
      if doc_map[:alias]
        doc_map[:alias].map {|tag| tag[:name] }
      else
        nil
      end
    end

    def detect_meta(doc_map)
      meta = {}
      (doc_map[:meta] || []).map do |tag|
        meta[tag[:name]] = [] unless meta[tag[:name]]
        meta[tag[:name]] << tag[:doc]
      end

      meta.each_pair do |key, value|
        tag = @meta_tags[key]
        meta[key] = tag.to_value(tag.boolean ? true : value)
      end

      meta[:required] = true if detect_required(doc_map)
      meta
    end

    def detect_required(doc_map)
      doc_map[:cfg] && doc_map[:cfg].first[:optional] == false
    end

    def detect_params(doc_map)
      combine_properties(doc_map[:param] || [])
    end

    def detect_subproperties(tagname, docs)
      prop_docs = docs.find_all {|tag| tag[:tagname] == tagname}
      prop_docs.length > 0 ? combine_properties(prop_docs)[0][:properties] : []
    end

    def combine_properties(raw_items)
      # First item can't be namespaced, if it is ignore the rest.
      if raw_items[0] && raw_items[0][:name] =~ /\./
        return [raw_items[0]]
      end

      # build name-index of all items
      index = {}
      raw_items.each {|it| index[it[:name]] = it }

      # If item name has no dots, add it directly to items array.
      # Otherwise look up the parent of item and add it as the
      # property of that parent.
      items = []
      raw_items.each do |it|
        if it[:name] =~ /^(.+)\.([^.]+)$/
          it[:name] = $2
          parent = index[$1]
          if parent
            parent[:properties] = [] unless parent[:properties]
            parent[:properties] << it
          else
            Logger.warn(:subproperty, "Ignoring subproperty #{$1}.#{$2}, no parent found with name '#{$1}'.", @filename, @linenr)
          end
        else
          items << it
        end
      end
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

    def detect_throws(doc_map)
      return unless doc_map[:throws]

      doc_map[:throws].map do |throws|
        {
          :type => throws[:type] || "Object",
          :doc => throws[:doc] || "",
        }
      end
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
      ignore_tags = [:param, :return, :throws, :meta]
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
