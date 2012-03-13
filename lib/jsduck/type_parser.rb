require 'strscan'

module JsDuck

  # Validates the syntax of type definitions
  #
  # Quick summary of supported types:
  #
  # - SomeType
  # - Name.spaced.Type
  # - Number[]
  # - String/RegExp
  # - Type...
  #
  # Details are covered in spec.
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

    #
    #     <alteration-type> ::= <varargs-type> [ ("/" | "|") <varargs-type> ]*
    #
    def alteration_type
      # Return immediately if varargs-type doesn't match
      return false unless varargs_type

      # Go through enumeration of types, separated with "/" or "|"
      while @input.check(/[\/|]/)
        @out << @input.scan(/[\/|]/)
        # Fail if there's no varargs-type after / or |
        return false unless varargs_type
      end

      true
    end

    #
    #     <varargs-type> ::= [ "..." ] <null-type> | <null-type> [ "..." ]
    #
    #     <null-type> ::= [ "?" | "!" ] <array-type>
    #
    #     <array-type> ::= <atomic-type> [ "[]" ]*
    #
    #     <atomic-type> ::= <type-name> | <union-type>
    #
    #     <union-type> ::= "(" <alteration-type> ")"
    #
    def varargs_type
      if @input.scan(/\.\.\./)
        varargs = true
        @out << "..."
      end

      if nullability = @input.scan(/[?!]/)
        @out << nullability
      end

      if @input.scan(/\(/)
        @out << "("

        return false unless alteration_type

        return false unless @input.scan(/\)/)
        @out << ")"
      else
        return false unless type_name
      end

      while @input.scan(/\[\]/)
        @out << "[]"
      end

      if !varargs
        @out << "..." if @input.scan(/\.\.\./)
      end

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
      elsif @relations.ignore?(name) || name == "undefined" || name == "*"
        @out << name
      else
        @error = :name
        return false
      end

      # All type names besides * can be followed by .<arguments>
      if name != "*" && @input.scan(/\.</)
        return false unless type_arguments
        return false unless @input.scan(/>/)
      end

      true
    end

    #
    #     <type-arguments> ::= <alteration-type> [ "," <alteration-type> ]*
    #
    def type_arguments
      # First argument is required
      return false unless alteration_type

      # Go through additional arguments, separated with ","
      while @input.check(/,/)
        @out << @input.scan(/,/)
        # Fail if there's no alteration-type after ","
        return false unless alteration_type
      end

      true
    end

  end

end
