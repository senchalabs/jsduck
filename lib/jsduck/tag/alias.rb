require "jsduck/tag/inheritdoc"
require "jsduck/js/utils"

module JsDuck::Tag
  class Alias < Inheritdoc
    def initialize
      @pattern = "alias"
      @tagname = :aliases
      @ext_define_pattern = "alias"
      @ext_define_default = {:aliases => []}
      @merge_context = :class
    end

    # For backwards compatibility decide whether the @alias was used
    # as @inheritdoc (@alias used to have the meaning of @inheritdoc
    # before) or as a real Ext4 style alias definition.
    def parse_doc(p, pos)
      if p.look(/([\w.]+)?#\w+/)
        parse_as_inheritdoc(p)
      else
        parse_as_alias(p)
      end
    end

    # @alias widget.foo
    def parse_as_alias(p)
      {
        :tagname => :aliases,
        :name => p.ident_chain,
      }
    end

    def process_doc(h, tags, pos)
      h[:aliases] = tags.map {|tag| tag[:name] }
    end

    def parse_ext_define(cls, ast)
      cls[:aliases] += JsDuck::Js::Utils.make_string_list(ast)
    end

    def merge(h, docs, code)
      h[:aliases] = build_aliases_hash(docs[:aliases] || code[:aliases] || [])
    end

    # Given array of full alias names like "foo.bar", "foo.baz"
    # build hash like {"foo" => ["bar", "baz"]}
    def build_aliases_hash(aliases)
      hash={}
      aliases.each do |a|
        if a =~ /^([^.]+)\.(.+)$/
          if hash[$1]
            hash[$1] << $2
          else
            hash[$1] = [$2]
          end
        end
      end
      hash
    end
  end
end
