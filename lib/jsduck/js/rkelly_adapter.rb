module JsDuck
  module Js

    # Converts RKelly AST into Esprima AST.
    class RKellyAdapter
      def adapt(node)
        case
        # Empty node
        when node.nil?
          nil

        # Fall-through nodes
        when FALL_THROUGH_NODES[node.class]
          adapt(node.value)
        when FALL_THROUGH_ARRAY_NODES[node.class]
          node.value.map {|v| adapt(v) }

        # Identifiers
        when RKelly::Nodes::ResolveNode == node.class
          {
            "type" => "Identifier",
            "name" => node.value,
          }

        # Literals
        when RKelly::Nodes::NumberNode == node.class
          {
            "type" => "Literal",
            "value" => node.value,
            "raw" => node.value.to_s,
          }
        when RKelly::Nodes::StringNode == node.class
          {
            "type" => "Literal",
            "value" => node.value,
            "raw" => node.value,
          }
        when RKelly::Nodes::RegexpNode == node.class
          {
            "type" => "Literal",
            "value" => node.value,
            "raw" => node.value,
          }
        when RKelly::Nodes::TrueNode == node.class
          {
            "type" => "Literal",
            "value" => true,
            "raw" => "true",
          }
        when RKelly::Nodes::FalseNode == node.class
          {
            "type" => "Literal",
            "value" => false,
            "raw" => "false",
          }
        when RKelly::Nodes::NullNode == node.class
          {
            "type" => "Literal",
            "value" => nil,
            "raw" => "null",
          }

        # Expressions
        when BINARY_NODES[node.class]
          {
            "type" => "BinaryExpression",
            "operator" => BINARY_NODES[node.class],
            "left" => adapt(node.left),
            "right" => adapt(node.value),
          }
        when UNARY_NODES[node.class]
          {
            "type" => "UnaryExpression",
            "operator" => UNARY_NODES[node.class],
            "argument" => adapt(node.value),
          }
        when ASSIGNMENT_NODES[node.class]
          {
            "type" => "AssignmentExpression",
            "operator" => ASSIGNMENT_NODES[node.class],
            "left" => adapt(node.left),
            "right" => adapt(node.value),
          }
        when RKelly::Nodes::FunctionExprNode == node.class
          {
            "type" => "FunctionExpression",
            "id" => node.value == "function" ? nil : {"type" => "Identifier", "name" => node.value},
            "params" => node.arguments.map {|a| adapt(a) },
            "body" => adapt(node.function_body),
          }
        when RKelly::Nodes::ThisNode == node.class
          {
            "type" => "ThisExpression",
          }
        when RKelly::Nodes::DotAccessorNode == node.class
          {
            "type" => "MemberExpression",
            "computed" => false,
            "object" => adapt(node.value),
            "property" => {"type" => "Identifier", "name" => node.accessor},
          }
        when RKelly::Nodes::BracketAccessorNode == node.class
          {
            "type" => "MemberExpression",
            "computed" => true,
            "object" => adapt(node.value),
            "property" => adapt(node.accessor),
          }
        when RKelly::Nodes::FunctionCallNode == node.class
          {
            "type" => "CallExpression",
            "callee" => adapt(node.value),
            "arguments" => adapt(node.arguments),
          }
        when RKelly::Nodes::NewExprNode == node.class
          {
            "type" => "NewExpression",
            "callee" => adapt(node.value),
            "arguments" => adapt(node.arguments),
          }
        when RKelly::Nodes::PrefixNode == node.class
          {
            "type" => "UpdateExpression",
            "operator" => node.value,
            "argument" => adapt(node.operand),
            "prefix" => true,
          }
        when RKelly::Nodes::PostfixNode == node.class
          {
            "type" => "UpdateExpression",
            "operator" => node.value,
            "argument" => adapt(node.operand),
            "prefix" => false,
          }
        when RKelly::Nodes::ParameterNode == node.class
          {
            "type" => "Identifier",
            "name" => node.value,
          }
        when RKelly::Nodes::ConditionalNode == node.class
          {
            "type" => "ConditionalExpression",
            "test" => adapt(node.conditions),
            "consequent" => adapt(node.value),
            "alternate" => adapt(node.else),
          }
        when RKelly::Nodes::CaseClauseNode == node.class
          {
            "type" => "SwitchCase",
            "test" => adapt(node.left),
            "consequent" => adapt(node.value),
          }
        when RKelly::Nodes::CommaNode == node.class
          {
            "type" => "SequenceExpression",
            "expressions" => flatten_sequence(node).map {|v| adapt(v) },
          }
        when RKelly::Nodes::ArrayNode == node.class
          {
            "type" => "ArrayExpression",
            "elements" => node.value.map {|v| adapt(v) },
          }
        when RKelly::Nodes::ObjectLiteralNode == node.class
          {
            "type" => "ObjectExpression",
            "properties" => node.value.map {|v| adapt(v) },
          }
        when RKelly::Nodes::PropertyNode == node.class
          {
            "type" => "Property",
            "key" => {"type" => "Identifier", "name" => node.name},
            "value" => adapt(node.value),
            "kind" => "init",
          }

        # Statements
        when RKelly::Nodes::ExpressionStatementNode == node.class
          {
            "type" => "ExpressionStatement",
            "expression" => adapt(node.value),
          }
        when RKelly::Nodes::IfNode == node.class
          {
            "type" => "IfStatement",
            "test" => adapt(node.conditions),
            "consequent" => adapt(node.value),
            "alternate" => adapt(node.else),
          }
        when RKelly::Nodes::WhileNode == node.class
          {
            "type" => "WhileStatement",
            "test" => adapt(node.left),
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::DoWhileNode == node.class
          {
            "type" => "DoWhileStatement",
            "test" => adapt(node.left),
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::ForNode == node.class
          {
            "type" => "ForStatement",
            "init" => adapt(node.init),
            "test" => adapt(node.test),
            "update" => adapt(node.counter),
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::ForInNode == node.class
          {
            "type" => "ForInStatement",
            "left" => adapt(node.left),
            "right" => adapt(node.right),
            "body" => adapt(node.value),
            "each" => false,
          }
        when RKelly::Nodes::WithNode == node.class
          {
            "type" => "WithStatement",
            "object" => adapt(node.left),
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::SwitchNode == node.class
          {
            "type" => "SwitchStatement",
            "discriminant" => adapt(node.left),
            "cases" => adapt(node.value),
          }
        when RKelly::Nodes::ReturnNode == node.class
          {
            "type" => "ReturnStatement",
            "argument" => adapt(node.value),
          }
        when RKelly::Nodes::BreakNode == node.class
          {
            "type" => "BreakStatement",
            "label" => node.value ? {"type" => "Identifier", "name" => node.value} : nil,
          }
        when RKelly::Nodes::ContinueNode == node.class
          {
            "type" => "ContinueStatement",
            "label" => node.value ? {"type" => "Identifier", "name" => node.value} : nil,
          }
        when RKelly::Nodes::TryNode == node.class
          {
            "type" => "TryStatement",
            "block" => adapt(node.value),
            "guardedHandlers" => [],
            "handlers" => node.catch_block ? [catch_clause(node)] : [],
            "finalizer" => adapt(node.finally_block),
          }
        when RKelly::Nodes::ThrowNode == node.class
          {
            "type" => "ThrowStatement",
            "argument" => adapt(node.value),
          }
        when RKelly::Nodes::LabelNode == node.class
          {
            "type" => "LabeledStatement",
            "label" => {"type" => "Identifier", "name" => node.name},
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::BlockNode == node.class
          {
            "type" => "BlockStatement",
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::FunctionBodyNode == node.class
          {
            "type" => "BlockStatement",
            "body" => adapt(node.value),
          }
        when RKelly::Nodes::EmptyStatementNode == node.class
          if node.value == "debugger"
            {
              "type" => "DebuggerStatement",
            }
          else
            {
              "type" => "EmptyStatement",
            }
          end

        # Declarations
        when RKelly::Nodes::VarStatementNode == node.class
          {
            "type" => "VariableDeclaration",
            "kind" => "var",
            "declarations" => node.value.map {|v| adapt(v) },
          }
        when RKelly::Nodes::ConstStatementNode == node.class
          {
            "type" => "VariableDeclaration",
            "kind" => "const",
            "declarations" => node.value.map {|v| adapt(v) },
          }
        when RKelly::Nodes::VarDeclNode == node.class
          {
            "type" => "VariableDeclarator",
            "id" => {"type" => "Identifier", "name" => node.name},
            "init" => adapt(node.value),
          }
        when RKelly::Nodes::FunctionDeclNode == node.class
          {
            "type" => "FunctionDeclaration",
            "id" => {"type" => "Identifier", "name" => node.value},
            "params" => node.arguments.map {|a| adapt(a) },
            "body" => adapt(node.function_body),
          }

        else
          # Unexpected node type
          node
        end
      end

      private

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
          "param" => {"type" => "Identifier", "name" => node.catch_var},
          "body" => adapt(node.catch_block),
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
