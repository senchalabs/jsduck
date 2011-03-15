require 'jsduck/doc_formatter'

module JsDuck

  # Export class data as hash with :cfg being replace with :cfgs and
  # including all the inherited members too.  Same for :properties,
  # :methods, and :events.
  #
  # Also all the :doc elements will be formatted - converted from
  # markdown to HTML and @links resolved.
  class Exporter
    attr_accessor :relations

    def initialize(relations)
      @relations = relations
      @formatter = DocFormatter.new
      @formatter.cssClass = 'docClass'
    end

    # Returns all data in Class object as hash.
    def export(cls)
      h = cls.to_hash
      h[:cfgs] = cls.members(:cfg)
      h[:properties] = cls.members(:property)
      h[:methods] = cls.members(:method)
      h[:events] = cls.members(:event)
      h.delete(:cfg)
      h.delete(:property)
      h.delete(:method)
      h.delete(:event)
      h[:component] = cls.inherits_from?("Ext.Component")
      h[:superclasses] = cls.superclasses.collect {|c| c.full_name }
      h[:subclasses] = @relations.subclasses(cls).collect {|c| c.full_name }
      h[:mixedInto] = @relations.mixed_into(cls).collect {|c| c.full_name }
      format_class(h)
    end

    # converts :doc properties from markdown to html and resolve @links
    def format_class(c)
      @formatter.context = c[:name]
      c[:doc] = @formatter.format(c[:doc]) if c[:doc]
      [:cfgs, :properties, :methods, :events].each do |type|
        c[type] = c[type].map {|m| format_member(m) }
      end
      c
    end

    def format_member(m)
      m = m.clone
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
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
