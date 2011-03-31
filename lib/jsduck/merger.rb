module JsDuck

  # Takes data from doc-comment and code that follows it and combines
  # these to pieces of information into one.  The code comes from
  # JsDuck::Parser and doc-comment from JsDuck::DocParser.
  #
  # The main method merge() produces a hash as a result.
  class Merger
    def merge(docs, code)
      case detect_doc_type(docs, code)
      when :class
        create_class(docs, code)
      when :event
        create_event(docs, code)
      when :method
        create_method(docs, code)
      when :cfg
        create_cfg(docs, code)
      when :property
        create_property(docs, code)
      when :css_var
        create_css_var(docs, code)
      when :css_mixin
        create_css_mixin(docs, code)
      end
    end

    # Detects whether the doc-comment is for class, cfg, event, method or property.
    def detect_doc_type(docs, code)
      doc_map = build_doc_map(docs)

      if doc_map[:class]
        :class
      elsif doc_map[:event]
        :event
      elsif doc_map[:method]
        :method
      elsif doc_map[:property] || doc_map[:type]
        :property
      elsif doc_map[:css_var]
        :css_var
      elsif code[:type] == :ext_define
        :class
      elsif code[:type] == :assignment && class_name?(*code[:left])
        :class
      elsif code[:type] == :function && class_name?(code[:name])
        :class
      elsif code[:type] == :css_mixin
        :css_mixin
      elsif doc_map[:cfg]
        :cfg
      elsif code[:type] == :function
        :method
      elsif code[:type] == :assignment && code[:right] && code[:right][:type] == :function
        :method
      else
        :property
      end
    end

    # Class name begins with upcase char
    def class_name?(*name_chain)
      return name_chain.last =~ /\A[A-Z]/
    end

    def create_class(docs, code)
      groups = group_class_docs(docs)
      result = create_bare_class(groups[:class], code)
      result[:cfg] = groups[:cfg].map { |tags| create_cfg(tags, {}, result[:name]) }
      result[:method] = []
      if groups[:constructor].length > 0
        constr = create_method(groups[:constructor], {})
        constr[:member] = result[:name]
        result[:method] << constr
      end
      result[:property] = []
      result[:event] = []
      result[:var] = []
      result
    end

    # Gathers all tags until first @cfg or @constructor into the first
    # bare :class group.  We have a special case for @xtype which in
    # ExtJS comments often appears after @constructor - so we
    # explicitly place it into :class group.
    #
    # Then gathers each @cfg and tags following it into :cfg group, so
    # that it becomes array of arrays of tags.  This is to allow some
    # configs to be marked with @private or whatever else.
    #
    # Finally gathers tags after @constructor into its group.
    def group_class_docs(docs)
      groups = {:class => [], :cfg => [], :constructor => []}
      group_name = :class
      docs.each do |tag|
        if tag[:tagname] == :cfg || tag[:tagname] == :constructor
          group_name = tag[:tagname]
          if tag[:tagname] == :cfg
            groups[:cfg] << []
          end
        end

        if tag[:tagname] == :xtype
          groups[:class] << tag
        elsif group_name == :cfg
          groups[:cfg].last << tag
        else
          groups[group_name] << tag
        end
      end
      groups
    end

    def create_bare_class(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :class,
        :name => detect_name(:class, doc_map, code, :full_name),
        :doc => detect_doc(docs),
        :extends => detect_extends(doc_map, code),
        :mixins => detect_mixins(doc_map, code),
        :xtype => detect_xtype(doc_map),
        :author => detect_author(doc_map),
        :singleton => !!doc_map[:singleton],
        :private => !!doc_map[:private],
      }
    end

    def create_method(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :method,
        :name => detect_name(:method, doc_map, code),
        :member => detect_member(doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(docs, code),
        :return => detect_return(doc_map),
        :private => !!doc_map[:private],
        :static => !!doc_map[:static],
      }
    end

    def create_event(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :event,
        :name => detect_name(:event, doc_map, code),
        :member => detect_member(doc_map),
        :doc => detect_doc(docs),
        :params => detect_params(docs, code),
        :private => !!doc_map[:private],
      }
    end

    def create_cfg(docs, code, member = nil)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :cfg,
        :name => detect_name(:cfg, doc_map, code),
        :member => detect_member(doc_map) || member,
        :type => detect_type(:cfg, doc_map, code),
        :doc => detect_doc(docs),
        :private => !!doc_map[:private],
      }
    end

    def create_property(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :property,
        :name => detect_name(:property, doc_map, code),
        :member => detect_member(doc_map),
        :type => detect_type(:property, doc_map, code),
        :doc => detect_doc(docs),
        :private => !!doc_map[:private],
        :static => !!doc_map[:static],
      }
    end

    def create_css_var(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :css_var,
        :name => detect_name(:css_var, doc_map, code),
        :member => detect_member(doc_map),
        :type => detect_type(:css_var, doc_map, code),
        :doc => detect_doc(docs),
        :private => !!doc_map[:private],
        :static => !!doc_map[:static],
      }
    end

    def create_css_mixin(docs, code)
      doc_map = build_doc_map(docs)
      return {
        :tagname => :css_mixin,
        :name => detect_name(:css_mixin, doc_map, code),
        :member => detect_member(doc_map),
        :doc => detect_doc(docs),
        :private => !!doc_map[:private],
        :static => !!doc_map[:static],
      }
    end

    def detect_name(tagname, doc_map, code, name_type = :last_name)
      main_tag = doc_map[tagname] ? doc_map[tagname].first : {}
      if main_tag[:name]
        main_tag[:name]
      elsif doc_map[:constructor]
        "constructor"
      elsif code[:type] == :function || code[:type] == :css_mixin
        code[:name]
      elsif code[:type] == :assignment
        name_type == :full_name ? code[:left].join(".") : code[:left].last
      elsif code[:type] == :ext_define
        name_type == :full_name ? code[:name] : code[:name].split(/\./).last
      else
        ""
      end
    end

    def detect_member(doc_map)
      if doc_map[:member]
        doc_map[:member].first[:member]
      else
        nil
      end
    end

    def detect_type(tagname, doc_map, code)
      main_tag = doc_map[tagname] ? doc_map[tagname].first : {}
      if main_tag[:type]
        main_tag[:type]
      elsif doc_map[:type]
        doc_map[:type].first[:type]
      elsif code[:type] == :function
        "Function"
      elsif code[:type] == :assignment && code[:right]
        if code[:right][:type] == :function
          "Function"
        elsif code[:right][:type] == :literal
          code[:right][:class]
        else
          "Object"
        end
      else
        "Object"
      end
    end

    def detect_extends(doc_map, code)
      if doc_map[:extends]
        doc_map[:extends].first[:extends]
      elsif code[:type] == :assignment && code[:right] && code[:right][:type] == :ext_extend
        code[:right][:extend].join(".")
      elsif code[:type] == :ext_define
        code[:extend]
      end
    end

    def detect_mixins(doc_map, code)
      if code[:type] == :ext_define && code[:mixins]
        code[:mixins]
      else
        []
      end
    end

    def detect_xtype(doc_map)
      doc_map[:xtype] ? doc_map[:xtype].first[:name] : nil
    end

    def detect_author(doc_map)
      doc_map[:author] ? doc_map[:author].first[:name] : nil
    end

    def detect_params(docs, code)
      implicit = detect_implicit_params(code)
      explicit = detect_explicit_params(docs)
      # Override implicit parameters with explicit ones
      params = []
      [implicit.length, explicit.length].max.times do |i|
        im = implicit[i] || {}
        ex = explicit[i] || {}
        doc = ex[:doc] || im[:doc] || ""
        params << {
          :type => ex[:type] || im[:type] || "Object",
          :name => ex[:name] || im[:name] || "",
          :doc => doc,
          # convert to boolean for JavaScript export, otherwise it's 0 or nil
          :optional => !!(doc =~ /\(optional\)/),
        }
      end
      params
    end

    def detect_implicit_params(code)
      if code[:type] == :function
        code[:params]
      elsif code[:type] == :assignment && code[:right] && code[:right][:type] == :function
        code[:right][:params]
      else
        []
      end
    end

    def detect_explicit_params(docs)
      docs.find_all {|tag| tag[:tagname] == :param}
    end

    def detect_return(doc_map)
      ret = doc_map[:return] ? doc_map[:return].first : {}
      return {
        :type => ret[:type] || "void",
        :doc => ret[:doc] || "",
      }
    end

    # Combines :doc-s of most tags
    # Ignores tags that have doc comment themselves
    def detect_doc(docs)
      ignore_tags = [:param, :return]
      doc_tags = docs.find_all { |tag| !ignore_tags.include?(tag[:tagname]) }
      doc_tags.map { |tag| tag[:doc] }.compact.join(" ")
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
