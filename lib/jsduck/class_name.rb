module JsDuck

  # Common routines for manipulating class names.
  class ClassName

    # Given a full class name extracts the "class"-part of the name.
    #
    #     ClassName.short("My.package.Foo") --> "Foo"
    #
    # Because we try to emulate ext-doc, it's not as simple as just
    # taking the last part.  See class_spec.rb for details.
    def self.short(name)
      parts = name.split(/\./)
      short = parts.pop
      while parts.length > 1 && parts.last =~ /^[A-Z]/
        short = parts.pop + "." + short
      end
      short
    end

  end

end
