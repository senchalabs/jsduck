require 'strscan'

module JsDuck

  # Validates the syntax of type definitions.
  #
  # The parser supports a combination of two syntaxes:
  #
  # 1. Traditional type expressions found in ExtJS code:
  #
  #     SomeType
  #     Name.spaced.Type
  #     Number[]
  #     String/RegExp
  #     Type...
  #
  # 2. Google Closure Compiler Type Expressions:
  #
  #     boolean
  #     Window
  #     goog.ui.Menu
  #
  #     Array.<string>
  #     Object.<string, number>
  #
  #     {myNum: number, myObject}
  #
  #     (number|boolean)
  #     ?number
  #     !Object
  #     ...number
  #     *
  #
  #     function(string, boolean): number
  #     function(new:goog.ui.Menu, string)
  #     function(this:goog.ui.Menu, string)
  #     function(?string=, number=)
  #     function(string, ...[number])
  # 
  # 3. Titanium Specific formats
  #
  #     Array<type> (equivalent to Closure Array.<type>)
  #     Dictionary<type>
  #     Callback<type> (equivalent to Closure {function(type)})
  #
  class TypeParser
    # Allows to check the type of error that was encountered.
    # It will be either of the two:
    # - :syntax - type definition syntax is incorrect
    # - :name - one of the names of the types is unknown
    attr_reader :error

    # When parsing was successful, then contains the output HTML - the
    # input type-definition with types themselves replaced with links.
    attr_reader :out

    # Initializes the parser with hash of valid type names and doc_formatter.
    def initialize(relations={}, formatter={})
      @relations = relations
      @formatter = formatter
      @primitives = {
        "boolean" => "Boolean",
        "number" => "Number",
        "string" => "String",
        "null" => "null",
        "undefined" => "undefined",
        "void" => "void",
      }
    end

    # Parses the type definition
    #
    #     <type> ::= <alteration-type>
    #
    def parse(str)
      @input = StringScanner.new(str)
      @error = :syntax
      @out = []

      # Return immediately if the base type doesn't match
      return false unless alteration_type

      # Concatenate all output
      @out = @out.join

      # Success if we have reached the end of input
      return @input.eos?
    end

    private

    #
    #     <alteration-type> ::= <varargs-type> [ ("/" | "|") <varargs-type> ]*
    #
    def alteration_type
      skip_whitespace

      # Return immediately if varargs-type doesn't match
      return false unless varargs_type

      skip_whitespace

      # Go through enumeration of types, separated with "/" or "|"
      while @input.check(/[\/|]/)
        @out << @input.scan(/[\/|]/)

        skip_whitespace
        return false unless varargs_type
        skip_whitespace
      end

      true
    end

    #
    #     <varargs-type> ::= "..." <null-type>
    #                      | "..." "[" <null-type> "]"
    #                      | <null-type> "..."
    #                      | <null-type>
    #
    def varargs_type
      if @input.scan(/\.\.\./)
        varargs = true
        @out << "..."
        if @input.scan(/\[/)
          varargs_bracketed = true
          @out << "["
        end
      end

      return false unless null_type

      if !varargs
        @out << "..." if @input.scan(/\.\.\./)
      end

      if varargs_bracketed
        return false unless @input.scan(/\]/)
        @out << "]"
      end

      true
    end

    #
    #     <null-type> ::= [ "?" | "!" ] <array-type>
    #
    #     <array-type> ::= <atomic-type> [ "[]" ]*
    #
    #     <atomic-type> ::= <union-type> | <record-type> | <function-type> | <type-name>
    #
    def null_type
      if nullability = @input.scan(/[?!]/)
        @out << nullability
      end

      if @input.check(/\(/)
        return false unless union_type
      elsif @input.check(/\{/)
        return false unless record_type
      elsif @input.check(/function\(/)
        return false unless function_type
      else
        return false unless type_name
      end

      while @input.scan(/\[\]/)
        @out << "[]"
      end

      true
    end

    #
    #     <union-type> ::= "(" <alteration-type> ")"
    #
    def union_type
      @out << @input.scan(/\(/)

      return false unless alteration_type

      return false unless @input.scan(/\)/)
      @out << ")"

      true
    end

    #
    #     <record-type> ::= "{" <rtype-item> [ "," <rtype-item> ]* "}"
    #
    def record_type
      @out << @input.scan(/\{/)

      return false unless rtype_item

      while @input.scan(/,/)
        @out << ","
        return false unless rtype_item
      end

      return false unless @input.scan(/\}/)
      @out << "}"

      true
    end

    #
    #     <rtype-item> ::= <ident> ":" <null-type>
    #                    | <ident>
    #
    def rtype_item
      skip_whitespace

      key = @input.scan(/[a-zA-Z0-9_]+/)
      return false unless key
      @out << key

      skip_whitespace
      if @input.scan(/:/)
        @out << ":"
        skip_whitespace
        return false unless null_type
        skip_whitespace
      end

      true
    end

    #
    #     <function-type> ::= "function(" <function-type-arguments> ")" [ ":" <null-type> ]
    #
    def function_type
      @out << @input.scan(/function\(/)

      skip_whitespace
      if !@input.check(/\)/)
        return false unless function_type_arguments
      end

      return false unless @input.scan(/\)/)
      @out << ")"

      skip_whitespace
      if @input.scan(/:/)
        @out << ":"
        skip_whitespace
        return false unless null_type
      end

      true
    end

    #
    #     <function-type-arguments> ::= <ftype-first-arg> [ "," <ftype-arg> ]*
    #
    #     <ftype-first-arg> ::= "new" ":" <type-name>
    #                         | "this" ":" <type-name>
    #                         | <ftype-arg>
    #
    def function_type_arguments
      skip_whitespace

      # First argument is special
      if s = @input.scan(/new\s*:\s*/)
        @out << s
        return false unless type_name
      elsif s = @input.scan(/this\s*:\s*/)
        @out << s
        return false unless type_name
      else
        return false unless ftype_arg
      end

      skip_whitespace

      # Go through additional arguments, separated with ","
      while @input.check(/,/)
        @out << @input.scan(/,/)
        return false unless ftype_arg
      end

      true
    end

    #
    #     <ftype-arg> ::= <alteration-type> [ "=" ]
    #
    def ftype_arg
      return false unless alteration_type

      # Each argument can be optional (ending with "=")
      @out << "=" if @input.scan(/[=]/)
      skip_whitespace

      true
    end

    #
    #     <type-name> ::= <type-application> | "*"
    #
    #     <type-application> ::= <ident-chain> [ "." "<" <type-arguments> ">" ]
    #
    #     <type-arguments> ::= <alteration-type> [ "," <alteration-type> ]*
    #
    #     <ident-chain> ::= <ident> [ "." <ident> ]*
    #
    #     <ident> ::= [a-zA-Z0-9_]+
    #
    def type_name
      name = @input.scan(/[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*|\*/)
      
      if !name
        return false
      elsif @relations[name]
        @out << @formatter.link(name, nil, name)
      elsif @primitives[name]
        if @relations[@primitives[name]]
          @out << @formatter.link(@primitives[name], nil, name)
        else
          @out << name
        end
      elsif @relations.ignore?(name) || name == "*"
        @out << name
      else
        @error = :name
        return false
      end

      # All type names besides * can be followed by .<arguments>
      if name != "*" && @input.scan(/\.</)
        @out << ".&lt;"
        return false unless type_arguments
        return false unless @input.scan(/>/)
        @out << "&gt;"
      end

      # Titanium wrapped types
      if /Dictionary|Array|Callback/.match(name) && @input.scan(/</)
        @out << "&lt;"
        return false unless type_arguments
        return false unless @input.scan(/>/)
        @out << "&gt;"
      end

      true
    end

    #
    #     <type-arguments> ::= <alteration-type> [ "," <alteration-type> ]*
    #
    def type_arguments
      skip_whitespace

      # First argument is required
      return false unless alteration_type

      skip_whitespace

      # Go through additional arguments, separated with ","
      while @input.check(/,/)
        @out << @input.scan(/,/)

        skip_whitespace
        return false unless alteration_type
        skip_whitespace
      end

      true
    end

    def skip_whitespace
      ws = @input.scan(/\s*/)
      @out << ws if ws
    end

  end

end
