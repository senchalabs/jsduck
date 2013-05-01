require "jsduck/tag/member_tag"
require "jsduck/render/method_signature"

module JsDuck::Tag
  # Implementation of @method tag.
  class Method < MemberTag
    def initialize
      @pattern = "method"
      @tagname = :method
      @member_type = {
        :name => :method,
        :category => :method_like,
        :title => "Methods",
        :position => MEMBER_POS_METHOD,
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
      h
    end

    def to_html(method, cls)
      JsDuck::Render::MethodSignature.render(method, cls)
    end
  end
end
