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

    def parse(str)
      @input = StringScanner.new(str)
      @error = :syntax
      @out = []

      # Return immediately if base type doesn't match
      return false unless base_type

      # Go through enumeration of types, separated with "/"
      while @input.check(/\//)
        @out << @input.scan(/\//)
        # Fail if there's no base type after "/"
        return false unless base_type
      end

      # The definition might end with an ellipsis
      @out << "..." if @input.scan(/\.\.\./)

      # Concatenate all output
      @out = @out.join

      # Success if we have reached the end of input
      return @input.eos?
    end

    # The basic type
    #
    #     <ident> [ "." <ident> ]* [ "[]" ]
    #
    # dot-separated identifiers followed by optional "[]"
    def base_type
      type = @input.scan(/[a-zA-Z_]+(\.[a-zA-Z_]+)*/)

      if !type
        return false
      elsif @relations[type]
        @out << @formatter.link(type, nil, type)
      elsif @relations.ignore?(type) || type == "undefined"
        @out << type
      else
        @error = :name
        return false
      end

      @out << "[]" if @input.scan(/\[\]/)

      true
    end

  end

end
