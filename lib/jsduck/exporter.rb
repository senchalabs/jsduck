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
      h[:members] = {}
      Class.default_members_hash.each_key do |key|
        h[:members][key] = cls.members(key)
        h[:statics][key] = cls.members(key, :statics)
      end
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
      c[:members].each_pair do |type, members|
        c[:members][type] = members.map {|m| format_member(m) }
      end
      c[:statics].each_pair do |type, members|
        c[:statics][type] = members.map {|m| format_member(m) }
      end
      c
    end

    def format_member(m)
      m = m.clone
      @formatter.doc_context = m
      m[:doc] = @formatter.format(m[:doc]) if m[:doc]
      m[:deprecated][:text] = @formatter.format(m[:deprecated][:text]) if m[:deprecated]
      if m[:params] || (m[:properties] && m[:properties].length > 0) || m[:default] || @formatter.too_long?(m[:doc])
        m[:shortDoc] = @formatter.shorten(m[:doc])
      end
      m[:params] = format_params(m[:params]) if m[:params]
      m[:return] = format_return(m[:return]) if m[:return]
      m[:properties] = format_subproperties(m[:properties]) if m[:properties]
      m
    end

    def format_params(params)
      params.map do |p|
        p = p.clone
        p[:doc] = @formatter.format(p[:doc]) if p[:doc]
        p[:properties] = format_subproperties(p[:properties]) if p[:properties]
        p
      end
    end

    def format_return(r)
      r = r.clone
      r[:doc] = @formatter.format(r[:doc]) if r[:doc]
      r
    end

    def format_subproperties(items)
      items.map do |it|
        it = it.clone
        it[:doc] = @formatter.format(it[:doc]) if it[:doc]
        it[:properties] = format_subproperties(it[:properties]) if it[:properties]
        it
      end
    end

  end

end
