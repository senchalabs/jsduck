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
    def parse(str)
      @input = StringScanner.new(str)

      # Return immediately if base type doesn't match
      return false unless base_type

      # Go through enumeration of types, separated with "/"
      while @input.check(/\//)
        @input.scan(/\//)
        # Fail if there's no base type after "/"
        return false unless base_type
      end

      # The definition might end with an ellipsis
      @input.scan(/\.\.\./)

      # Success if we have reached the end of input
      return @input.eos?
    end

    # The basic type
    #
    #     <ident> [ "." <ident> ]* [ "[]" ]
    #
    # dot-separated identifiers followed by optional "[]"
    def base_type
      @input.scan(/[a-zA-Z_]+(\.[a-zA-Z_]+)*(\[\])?/)
    end

  end

end
