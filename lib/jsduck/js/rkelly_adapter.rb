require 'rkelly'

module JsDuck
  module Js

    # Converts RKelly AST into Esprima AST.
    class RKellyAdapter
      def adapt(node)
        ast = adapt_root(node)
        ast["comments"] = node.comments.map {|c| adapt_comment(c) }
        ast
      end

      private

      def adapt_comment(comment)
        if comment.value =~ /\A\/\*/
          {
            "type" => "Block",
            "value" => comment.value.sub(/\A\/\*/, "").sub(/\*\/\z/, ""),
            "range" => [comment.range.from.index, comment.range.to.index+1],
          }
        else
          {
            "type" => "Line",
            "value" => comment.value.sub(/\A\/\//, ""),
            "range" => [comment.range.from.index, comment.range.to.index+1],
          }
        end
      end

      def adapt_root(node)
        make(node, {
          "type" => "Program",
          "body" => adapt_node(node),
        })
      end

      def adapt_node(node)
        case
        # Empty node
        when node.nil?
          nil

        # Fall-through nodes
        when FALL_THROUGH_NODES[node.class]
          adapt_node(node.value)
        when FALL_THROUGH_ARRAY_NODES[node.class]
          node.value.map {|v| adapt_node(v) }

        # Identifiers
        when RKelly::Nodes::ResolveNode == node.class
          make(node, {
            "type" => "Identifier",
            "name" => node.value,
          })

        # Literals
        when RKelly::Nodes::NumberNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => node.value,
            "raw" => node.value.to_s,
          })
        when RKelly::Nodes::StringNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => eval(node.value),
            "raw" => node.value,
          })
        when RKelly::Nodes::RegexpNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => node.value,
            "raw" => node.value,
          })
        when RKelly::Nodes::TrueNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => true,
            "raw" => "true",
          })
        when RKelly::Nodes::FalseNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => false,
            "raw" => "false",
          })
        when RKelly::Nodes::NullNode == node.class
          make(node, {
            "type" => "Literal",
            "value" => nil,
            "raw" => "null",
          })

        # Expressions
        when BINARY_NODES[node.class]
          make(node, {
            "type" => "BinaryExpression",
            "operator" => BINARY_NODES[node.class],
            "left" => adapt_node(node.left),
            "right" => adapt_node(node.value),
          })
        when UNARY_NODES[node.class]
          make(node, {
            "type" => "UnaryExpression",
            "operator" => UNARY_NODES[node.class],
            "argument" => adapt_node(node.value),
          })
        when ASSIGNMENT_NODES[node.class]
          make(node, {
            "type" => "AssignmentExpression",
            "operator" => ASSIGNMENT_NODES[node.class],
            "left" => adapt_node(node.left),
            "right" => adapt_node(node.value),
          })
        when RKelly::Nodes::FunctionExprNode == node.class
          make(node, {
            "type" => "FunctionExpression",
            "id" => node.value == "function" ? nil : {
                "type" => "Identifier",
                "name" => node.value,
                "range" => offset_range(node, :value, "function "),
              },
            "params" => node.arguments.map {|a| adapt_node(a) },
            "body" => adapt_node(node.function_body),
          })
        when RKelly::Nodes::ThisNode == node.class
          make(node, {
            "type" => "ThisExpression",
          })
        when RKelly::Nodes::DotAccessorNode == node.class
          make(node, {
            "type" => "MemberExpression",
            "computed" => false,
            "object" => adapt_node(node.value),
            "property" => {
                "type" => "Identifier",
                "name" => node.accessor,
                "range" => offset_range(node, :accessor),
              },
          })
        when RKelly::Nodes::BracketAccessorNode == node.class
          make(node, {
            "type" => "MemberExpression",
            "computed" => true,
            "object" => adapt_node(node.value),
            "property" => adapt_node(node.accessor),
          })
        when RKelly::Nodes::FunctionCallNode == node.class
          make(node, {
            "type" => "CallExpression",
            "callee" => adapt_node(node.value),
            "arguments" => adapt_node(node.arguments),
          })
        when RKelly::Nodes::NewExprNode == node.class
          make(node, {
            "type" => "NewExpression",
            "callee" => adapt_node(node.value),
            "arguments" => adapt_node(node.arguments),
          })
        when RKelly::Nodes::PrefixNode == node.class
          make(node, {
            "type" => "UpdateExpression",
            "operator" => node.value,
            "argument" => adapt_node(node.operand),
            "prefix" => true,
          })
        when RKelly::Nodes::PostfixNode == node.class
          make(node, {
            "type" => "UpdateExpression",
            "operator" => node.value,
            "argument" => adapt_node(node.operand),
            "prefix" => false,
          })
        when RKelly::Nodes::ParameterNode == node.class
          make(node, {
            "type" => "Identifier",
            "name" => node.value,
          })
        when RKelly::Nodes::ConditionalNode == node.class
          make(node, {
            "type" => "ConditionalExpression",
            "test" => adapt_node(node.conditions),
            "consequent" => adapt_node(node.value),
            "alternate" => adapt_node(node.else),
          })
        when RKelly::Nodes::CaseClauseNode == node.class
          make(node, {
            "type" => "SwitchCase",
            "test" => adapt_node(node.left),
            "consequent" => adapt_node(node.value),
          })
        when RKelly::Nodes::CommaNode == node.class
          make(node, {
            "type" => "SequenceExpression",
            "expressions" => flatten_sequence(node).map {|v| adapt_node(v) },
          })
        when RKelly::Nodes::ArrayNode == node.class
          make(node, {
            "type" => "ArrayExpression",
            "elements" => node.value.map {|v| adapt_node(v) },
          })
        when RKelly::Nodes::ObjectLiteralNode == node.class
          make(node, {
            "type" => "ObjectExpression",
            "properties" => node.value.map {|v| adapt_node(v) },
          })
        when RKelly::Nodes::PropertyNode == node.class
          make(node, {
            "type" => "Property",
            "key" =>
              if node.name.is_a?(Numeric)
                {
                  "type" => "Literal",
                  "value" => node.name,
                  "raw" => node.name.to_s,
                  "range" => offset_range(node, :name),
                }
              elsif node.name =~ /['"]/
                {
                  "type" => "Literal",
                  "value" => eval(node.name),
                  "raw" => node.name,
                  "range" => offset_range(node, :name),
                }
              else
                {
                  "type" => "Identifier",
                  "name" => node.name,
                  "range" => offset_range(node, :name),
                }
              end,
            "value" => adapt_node(node.value),
            "kind" => "init",
          })

        # Statements
        when RKelly::Nodes::ExpressionStatementNode == node.class
          make(node, {
            "type" => "ExpressionStatement",
            "expression" => adapt_node(node.value),
          })
        when RKelly::Nodes::IfNode == node.class
          make(node, {
            "type" => "IfStatement",
            "test" => adapt_node(node.conditions),
            "consequent" => adapt_node(node.value),
            "alternate" => adapt_node(node.else),
          })
        when RKelly::Nodes::WhileNode == node.class
          make(node, {
            "type" => "WhileStatement",
            "test" => adapt_node(node.left),
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::DoWhileNode == node.class
          make(node, {
            "type" => "DoWhileStatement",
            "test" => adapt_node(node.value),
            "body" => adapt_node(node.left),
          })
        when RKelly::Nodes::ForNode == node.class
          make(node, {
            "type" => "ForStatement",
            "init" => adapt_node(node.init),
            "test" => adapt_node(node.test),
            "update" => adapt_node(node.counter),
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::ForInNode == node.class
          make(node, {
            "type" => "ForInStatement",
            "left" => adapt_node(node.left),
            "right" => adapt_node(node.right),
            "body" => adapt_node(node.value),
            "each" => false,
          })
        when RKelly::Nodes::WithNode == node.class
          make(node, {
            "type" => "WithStatement",
            "object" => adapt_node(node.left),
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::SwitchNode == node.class
          make(node, {
            "type" => "SwitchStatement",
            "discriminant" => adapt_node(node.left),
            "cases" => adapt_node(node.value),
          })
        when RKelly::Nodes::ReturnNode == node.class
          make(node, {
            "type" => "ReturnStatement",
            "argument" => adapt_node(node.value),
          })
        when RKelly::Nodes::BreakNode == node.class
          make(node, {
            "type" => "BreakStatement",
            "label" => node.value ? {
                "type" => "Identifier",
                "name" => node.value,
                "range" => offset_range(node, :value, "break "),
              } : nil,
          })
        when RKelly::Nodes::ContinueNode == node.class
          make(node, {
            "type" => "ContinueStatement",
            "label" => node.value ? {
                "type" => "Identifier",
                "name" => node.value,
                "range" => offset_range(node, :value),
              } : nil,
          })
        when RKelly::Nodes::TryNode == node.class
          make(node, {
            "type" => "TryStatement",
            "block" => adapt_node(node.value),
            "guardedHandlers" => [],
            "handlers" => node.catch_block ? [catch_clause(node)] : [],
            "finalizer" => adapt_node(node.finally_block),
          })
        when RKelly::Nodes::ThrowNode == node.class
          make(node, {
            "type" => "ThrowStatement",
            "argument" => adapt_node(node.value),
          })
        when RKelly::Nodes::LabelNode == node.class
          make(node, {
            "type" => "LabeledStatement",
            "label" => {
                "type" => "Identifier",
                "name" => node.name,
                "range" => offset_range(node, :name),
              },
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::BlockNode == node.class
          make(node, {
            "type" => "BlockStatement",
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::FunctionBodyNode == node.class
          make(node, {
            "type" => "BlockStatement",
            "body" => adapt_node(node.value),
          })
        when RKelly::Nodes::EmptyStatementNode == node.class
          if node.value == "debugger"
            make(node, {
              "type" => "DebuggerStatement",
            })
          else
            make(node, {
              "type" => "EmptyStatement",
            })
          end

        # Declarations
        when RKelly::Nodes::VarStatementNode == node.class
          make(node, {
            "type" => "VariableDeclaration",
            "kind" => "var",
            "declarations" => node.value.map {|v| adapt_node(v) },
          })
        when RKelly::Nodes::ConstStatementNode == node.class
          make(node, {
            "type" => "VariableDeclaration",
            "kind" => "const",
            "declarations" => node.value.map {|v| adapt_node(v) },
          })
        when RKelly::Nodes::VarDeclNode == node.class
          make(node, {
            "type" => "VariableDeclarator",
            "id" => {
                "type" => "Identifier",
                "name" => node.name,
                "range" => offset_range(node, :name),
              },
            "init" => adapt_node(node.value),
          })
        when RKelly::Nodes::FunctionDeclNode == node.class
          make(node, {
            "type" => "FunctionDeclaration",
            "id" => {
                "type" => "Identifier",
                "name" => node.value,
                "range" => offset_range(node, :value, "function "),
              },
            "params" => node.arguments.map {|a| adapt_node(a) },
            "body" => adapt_node(node.function_body),
          })

        else
          # Unexpected node type
          node
        end
      end

      # augments node data with range info.
      def make(node, config)
        config["range"] = [node.range.from.index, node.range.to.index+1, node.range.from.line]
        config
      end

      # Calculates "range" array from the start position of the node,
      # its field and given offset prefix (amount of characters to
      # discard from the beginning).
      def offset_range(node, field, prefix="")
        line = node.range.from.line
        i = node.range.from.index
        offset = prefix.length
        length = node.send(field).to_s.length
        return [i + offset, i + offset + length, line]
      end

      def flatten_sequence(node)
        if node.is_a?(RKelly::Nodes::CommaNode)
          [flatten_sequence(node.left), flatten_sequence(node.value)].flatten
        else
          node
        end
      end

      def catch_clause(node)
        {
          "type" => "CatchClause",
          "param" => {
              "type" => "Identifier",
              "name" => node.catch_var,
              "range" => [
                node.catch_block.range.from.index - (") ".length + node.catch_var.length),
                node.catch_block.range.from.index - (") ".length),
                node.catch_block.range.from.line,
              ]
            },
          "body" => adapt_node(node.catch_block),
          "range" => [
            node.catch_block.range.from.index - ("catch () ".length + node.catch_var.length),
            node.catch_block.range.to.index+1,
            node.catch_block.range.from.line,
          ]
        }
      end

      BINARY_NODES = {
        RKelly::Nodes::SubtractNode => "-",
        RKelly::Nodes::LessOrEqualNode => "<=",
        RKelly::Nodes::GreaterOrEqualNode => ">=",
        RKelly::Nodes::AddNode => "+",
        RKelly::Nodes::MultiplyNode => "*",
        RKelly::Nodes::NotEqualNode => "!=",
        RKelly::Nodes::LogicalAndNode => "&&",
        RKelly::Nodes::UnsignedRightShiftNode => ">>>",
        RKelly::Nodes::ModulusNode => "%",
        RKelly::Nodes::NotStrictEqualNode => "!==",
        RKelly::Nodes::LessNode => "<",
        RKelly::Nodes::InNode => "in",
        RKelly::Nodes::GreaterNode => ">",
        RKelly::Nodes::BitOrNode => "|",
        RKelly::Nodes::StrictEqualNode => "===",
        RKelly::Nodes::LogicalOrNode => "||",
        RKelly::Nodes::BitXOrNode => "^",
        RKelly::Nodes::LeftShiftNode => "<"+"<",
        RKelly::Nodes::EqualNode => "==",
        RKelly::Nodes::BitAndNode => "&",
        RKelly::Nodes::InstanceOfNode => "instanceof",
        RKelly::Nodes::DivideNode => "/",
        RKelly::Nodes::RightShiftNode => ">>",
      }

      UNARY_NODES = {
        RKelly::Nodes::UnaryMinusNode => "-",
        RKelly::Nodes::UnaryPlusNode => "+",
        RKelly::Nodes::LogicalNotNode => "!",
        RKelly::Nodes::BitwiseNotNode => "~",
        RKelly::Nodes::TypeOfNode => "typeof",
        RKelly::Nodes::DeleteNode => "delete",
        RKelly::Nodes::VoidNode => "void",
      }

      ASSIGNMENT_NODES = {
        RKelly::Nodes::OpEqualNode => "=",
        RKelly::Nodes::OpMultiplyEqualNode => "*=",
        RKelly::Nodes::OpDivideEqualNode => "/=",
        RKelly::Nodes::OpLShiftEqualNode => "<<=",
        RKelly::Nodes::OpMinusEqualNode => "-=",
        RKelly::Nodes::OpPlusEqualNode => "+=",
        RKelly::Nodes::OpModEqualNode => "%=",
        RKelly::Nodes::OpXOrEqualNode => "^=",
        RKelly::Nodes::OpRShiftEqualNode => ">>=",
        RKelly::Nodes::OpAndEqualNode => "&=",
        RKelly::Nodes::OpURShiftEqualNode => ">>>=",
        RKelly::Nodes::OpOrEqualNode => "|=",
      }

      FALL_THROUGH_NODES = {
        RKelly::Nodes::AssignExprNode => true,
        RKelly::Nodes::ParentheticalNode => true,
        RKelly::Nodes::ElementNode => true,
      }

      FALL_THROUGH_ARRAY_NODES = {
        RKelly::Nodes::SourceElementsNode => true,
        RKelly::Nodes::ArgumentsNode => true,
        RKelly::Nodes::CaseBlockNode => true,
      }

    end

  end
end
