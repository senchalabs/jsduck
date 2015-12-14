require "jsduck/tag/member_tag"
require "jsduck/params_merger"

module JsDuck::Tag
  # Implementation of @method tag.
  class Method < MemberTag
    def initialize
      @pattern = "method"
      @tagname = :method
      @member_type = {
        :title => "Methods",
        :position => MEMBER_POS_METHOD,
        :icon => File.dirname(__FILE__) + "/icons/method.png",
        :subsections => [
          {:title => "Instance methods", :filter => {:static => false}, :default => true},
          {:title => "Static methods", :filter => {:static => true}},
        ]
      }
    end

    # @method name ...
    def parse_doc(p, pos)
      {
        :tagname => :method,
        :name => p.ident,
      }
    end

    # Onle sets the name when it's actually specified.
    # Otherwise we might overwrite name coming from @constructor.
    def process_doc(h, tags, pos)
      h[:name] = tags[0][:name] if tags[0][:name]
    end

    def process_code(code)
      h = super(code)
      h[:params] = code[:params]
      h[:chainable] = code[:chainable]
      h[:fires] = code[:fires]
      h[:method_calls] = code[:method_calls]
      h
    end

    def merge(h, docs, code)
      JsDuck::ParamsMerger.merge(h, docs, code)
    end

    def to_html(m, cls)
      new_kw(m) + method_link(m, cls) + member_params(m[:params]) + return_value(m)
    end

    private

    def new_kw(m)
      constructor?(m) ? "<strong class='new-keyword'>new</strong>" : ""
    end

    def method_link(m, cls)
      if constructor?(m)
        member_link(:owner => m[:owner], :id => m[:id], :name => cls[:name])
      else
        member_link(m)
      end
    end

    def constructor?(m)
      m[:name] == "constructor"
    end

    def return_value(m)
      m[:return] ? (" : " + m[:return][:html_type]) : ""
    end

  end
end
