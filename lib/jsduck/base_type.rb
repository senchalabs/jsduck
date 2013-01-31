require 'jsduck/tag_registry'

module JsDuck

  # Detects the type of documentation object: class, method, cfg, etc
  class BaseType
    # Given parsed documentation and code, returns the tagname for
    # documentation item.
    #
    # @param doc_map Result from DocParser turned into hash of tags.
    # @param code Result from Ast#detect or CssParser#parse
    # @returns :class or any of the member type symbols (:method, :event, ...).
    #
    def self.detect(doc_map, code)
      if doc_map[:class] || doc_map[:override]
        :class
      elsif type = detect_member(doc_map)
        type
      elsif doc_map[:type]
        # @type also results in property
        :property
      elsif code[:tagname] == :class
        :class
      elsif code[:tagname] == :css_mixin
        :css_mixin
      elsif doc_map[:cfg]
        :cfg
      elsif doc_map[:constructor]
        :method
      elsif doc_map[:params] || doc_map[:return]
        :method
      else
        code[:tagname]
      end
    end

    # Detects any of the members defined using a Tag class.
    # Returns the detected member type on success.
    # Otherwise nil.
    def self.detect_member(doc_map)
      type = TagRegistry.member_type_names.find {|type| doc_map[type] }

      if type == :cfg
        # Only detect a single @cfg as a :cfg.
        # Multiple ones can be part of a class.
        return (doc_map[:cfg].length == 1) ? :cfg : nil
      else
        type
      end
    end
  end

end
