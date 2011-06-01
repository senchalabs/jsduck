require 'jsduck/doc_formatter'

module JsDuck

  # Export class data as hash with :cfg being replace with :cfgs and
  # including all the inherited members too.  Same for :properties,
  # :methods, and :events.
  #
  # Also all the :doc elements will be formatted - converted from
  # markdown to HTML and @links resolved.
  class Exporter
    def initialize(relations, formatter)
      @relations = relations
      @formatter = formatter
    end

    # Returns all data in Class object as hash.
    def export(cls)
      h = cls.to_hash
      h[:cfg] = cls.members(:cfg)
      h[:property] = cls.members(:property)
      h[:method] = cls.members(:method)
      h[:event] = cls.members(:event)
      h[:cssVar] = cls.members(:css_var)
      h.delete(:css_var)
      h[:cssMixin] = cls.members(:css_mixin)
      h.delete(:css_mixin)
      h[:component] = cls.inherits_from?("Ext.Component")
      h[:superclasses] = cls.superclasses.collect {|c| c.full_name }
      h[:subclasses] = @relations.subclasses(cls).collect {|c| c.full_name }
      h[:mixedInto] = @relations.mixed_into(cls).collect {|c| c.full_name }
      h[:allMixins] = cls.all_mixins.collect {|c| c.full_name }
      format_class(h)
    end

    # converts :doc properties from markdown to html and resolve @links
    def format_class(c)
      @formatter.class_context = c[:name]
      @formatter.doc_context = c
      c[:doc] = @formatter.format(c[:doc]) if c[:doc]
      [:cfg, :property, :method, :event, :cssVar, :cssMixin].each do |type|
        c[type] = c[type].map {|m| format_member(m) }
      end
      c
    end

    def format_member(m)
      m = m.clone
      @formatter.doc_context = m
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
      m[:deprecated][:text] = @formatter.format(m[:deprecated][:text]) if m[:deprecated]
      if m[:params] || @formatter.too_long?(m[:doc])
        m[:shortDoc] = @formatter.shorten(m[:doc])
      end
      m[:params] = format_params(m[:params]) if m[:params]
      m[:return] = format_return(m[:return]) if m[:return]
      m
    end

    def format_params(params)
      params.map do |p|
        p = p.clone
        p[:doc] = @formatter.format(p[:doc]) if p[:doc]
        p
      end
    end

    def format_return(r)
      r = r.clone
      r[:doc] = @formatter.format(r[:doc]) if r[:doc]
      r
    end

  end

end
