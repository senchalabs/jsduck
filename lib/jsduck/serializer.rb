module JsDuck

  # Transforms Esprima AST into string
  class Serializer

    # Turns AST node into string
    def to_s(ast)
      case ast["type"]
      when "Program"
        ast["body"].map {|s| to_s(s) }.join

      # Statements

      when "BlockStatement"
        "{" + ast["body"].map {|s| to_s(s) }.join + "}"

      when "BreakStatement"
        "break" + (ast["label"] ? " " + to_s(ast["label"]) : "") + ";"

      when "ContinueStatement"
        "continue" + (ast["label"] ? " " + to_s(ast["label"]) : "") + ";"

      when "DoWhileStatement"
        "do " + to_s(ast["body"]) + " while (" + to_s(ast["test"]) + ");"

      when "DebuggerStatement"
        "debugger;"

      when "EmptyStatement"
        ";"

      when "ExpressionStatement"
        to_s(ast["expression"]) + ";"

      when "ForStatement"
        init = ast["init"] ? to_s(ast["init"]).sub(/;\Z/, "") : ""
        test = ast["test"] ? to_s(ast["test"]) : ""
        update = ast["update"] ? to_s(ast["update"]) : ""
        "for (" + init + "; " + test + "; " + update + ") " + to_s(ast["body"])

      when "ForInStatement"
        left = to_s(ast["left"]).sub(/;\Z/, "")
        right = to_s(ast["right"])
        "for (" + left + " in " + right + ") " + to_s(ast["body"])

      when "IfStatement"
        alternate = ast["alternate"] ? " else " + to_s(ast["alternate"]) : ""
        "if (" + to_s(ast["test"]) + ") " + to_s(ast["consequent"]) + alternate

      when "LabeledStatement"
        to_s(ast["label"]) + ": " + to_s(ast["body"])

      when "ReturnStatement"
        "return " + to_s(ast["argument"]) + ";"

      when "SwitchStatement"
        "switch (" + to_s(ast["discriminant"]) + ") {" + ast["cases"].map {|c| to_s(c) }.join + "}"

      when "SwitchCase"
        test = ast["test"] ? "case " + to_s(ast["test"]) : "default"
        test + ": " + ast["consequent"].map {|c| to_s(c) }.join

      when "ThrowStatement"
        "throw " + to_s(ast["argument"]) + ";"

      when "TryStatement"
        handlers = ast["handlers"].map {|h| to_s(h) }.join
        finalizer = ast["finalizer"] ? " finally " + to_s(ast["finalizer"]) : ""
        "try " + to_s(ast["block"]) + handlers + finalizer

      when "CatchClause"
        param = ast["param"] ? to_s(ast["param"]) : ""
        " catch (" + param + ") " + to_s(ast["body"])

      when "WhileStatement"
        "while (" + to_s(ast["test"]) + ") " + to_s(ast["body"])

      when "WithStatement"
        "with (" + to_s(ast["object"]) + ") " + to_s(ast["body"])


      # Declarations

      when "FunctionDeclaration"
        function(ast)

      when "VariableDeclaration"
        ast["kind"] + " " + list(ast["declarations"]) + ";"

      when "VariableDeclarator"
        if ast["init"]
          to_s(ast["id"]) + " = " + to_s(ast["init"])
        else
          to_s(ast["id"])
        end

      # Expressions

      when "AssignmentExpression"
        to_s(ast["left"]) + " " + ast["operator"] + " " + to_s(ast["right"])

      when "ArrayExpression"
        "[" + list(ast["elements"]) + "]"

      when "BinaryExpression"
        to_s(ast["left"]) + " " + ast["operator"] + " " + to_s(ast["right"])

      when "CallExpression"
        call(ast)

      when "ConditionalExpression"
        to_s(ast["test"]) + " ? " + to_s(ast["consequent"]) + " : " + to_s(ast["alternate"])

      when "FunctionExpression"
        function(ast)

      when "LogicalExpression"
        to_s(ast["left"]) + " " + ast["operator"] + " " + to_s(ast["right"])

      when "MemberExpression"
        if ast["computed"]
          to_s(ast["object"]) + "[" + to_s(ast["property"]) + "]"
        else
          to_s(ast["object"]) + "." + to_s(ast["property"])
        end

      when "NewExpression"
        "new " + call(ast)

      when "ObjectExpression"
        "{" + list(ast["properties"]) + "}"

      when "Property"
        to_s(ast["key"]) + ": " + to_s(ast["value"])

      when "SequenceExpression"
        list(ast["expressions"])

      when "ThisExpression"
        "this"

      when "UnaryExpression"
        ast["operator"] + to_s(ast["argument"])

      when "UpdateExpression"
        if ast["prefix"]
          ast["operator"] + to_s(ast["argument"])
        else
          to_s(ast["argument"]) + ast["operator"]
        end

      # Basics

      when "Identifier"
        ast["name"]

      when "Literal"
        ast["value"].to_s

      else
        throw "Unknown node type: "+ast["type"]
      end
    end

    # serializes function declaration or expression
    def function(ast)
      params = list(ast["params"])
      id = ast["id"] ? to_s(ast["id"]) : ""
      "function " + id + "(" + params + ") " + to_s(ast["body"])
    end

    # serializes list of comma-separated items
    def list(array)
      array.map {|x| to_s(x) }.join(", ")
    end

    # serializes call- and new-expression
    def call(ast)
      to_s(ast["callee"]) + "(" + list(ast["arguments"]) + ")"
    end

  end

end

