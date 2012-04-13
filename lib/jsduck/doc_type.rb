module JsDuck

  # Detects the type of documentation object: class, method, cfg, etc
  class DocType
    # Given parsed documentation and code, returns the tagname for
    # documentation item.
    #
    # @param docs parsing result from DocParser
    # @param ast :code from Result of EsprimaParser
    # @returns One of: :class, :method, :event, :cfg, :property, :css_var
    #
    def detect(docs, ast)
      doc_map = build_doc_map(docs)
      ast = ast || {}

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
      elsif doc_map[:cfg] && doc_map[:cfg].length == 1
        # When just one @cfg, avoid treating it as @class
        :cfg
      else
        exp = expression?(ast) ? ast["expression"] : nil
        var = var?(ast) ? ast["declarations"][0] : nil

        if exp && call?(exp) && ext_define?(exp["callee"])
          :class
        elsif exp && assignment?(exp) && class_name?(exp["left"])
          :class
        elsif var && class_name?(var["id"])
          :class
        elsif function?(ast) && class_name?(ast["id"])
          :class
        elsif ast[:type] == :css_mixin
          :css_mixin
        elsif doc_map[:cfg]
          :cfg
        elsif function?(ast)
          :method
        elsif exp && assignment?(exp) && function?(exp["right"])
          :method
        elsif var && function?(var["init"])
          :method
        elsif property?(ast) && function?(ast["value"])
          :method
        elsif doc_map[:return] || doc_map[:param]
          :method
        else
          :property
        end
      end
    end

    private

    def expression?(ast)
      ast["type"] == "ExpressionStatement"
    end

    def call?(ast)
      ast["type"] == "CallExpression"
    end

    def assignment?(ast)
      ast["type"] == "AssignmentExpression"
    end

    def ext_define?(callee)
      ["Ext.define", "Ext.ClassManager.create"].include?(to_s(callee))
    end

    def function?(ast)
      ast["type"] == "FunctionDeclaration" || ast["type"] == "FunctionExpression" || empty_fn?(ast)
    end

    def empty_fn?(ast)
      ast["type"] == "MemberExpression" && to_s(ast) == "Ext.emptyFn"
    end

    def var?(ast)
      ast["type"] == "VariableDeclaration"
    end

    def property?(ast)
      ast["type"] == "Property"
    end

    # Class name begins with upcase char
    def class_name?(ast)
      return to_s(ast).split(/\./).last =~ /\A[A-Z]/
    end

    def to_s(ast)
      case ast["type"]
      when "MemberExpression"
        if ast["computed"]
          to_s(ast["object"]) + "[" + to_s(ast["property"]) + "]"
        else
          to_s(ast["object"]) + "." + to_s(ast["property"])
        end
      when "Identifier"
        ast["name"]
      when "Literal"
        ast["value"]
      end
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

