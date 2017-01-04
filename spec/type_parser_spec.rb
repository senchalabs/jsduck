require "jsduck/relations"
require "jsduck/type_parser"
require "jsduck/doc_formatter"
require "jsduck/class"

describe JsDuck::TypeParser do

  def parse(str)
    relations = JsDuck::Relations.new([], [
      "String",
      "Number",
      "RegExp",
      "Array",
      "Ext.form.Panel",
      "Ext.Element",
      "Ext.fx2.Anim",
    ])
    JsDuck::TypeParser.new(relations).parse(str)
  end

  it "matches single-quoted string literal" do
    parse("'foo'").should == true
  end

  it "matches double-quoted string literal" do
    parse('"blah blah"').should == true
  end

  it "matches string literal with escape quote inside" do
    parse('"blah \\"blah"').should == true
  end

  it "matches integer number literal" do
    parse('42').should == true
  end

  it "matches negative number literal" do
    parse('-6').should == true
  end

  it "matches float number literal" do
    parse('3.14').should == true
  end

  it "matches simple type" do
    parse("String").should == true
  end

  it "matches namespaced type" do
    parse("Ext.form.Panel").should == true
  end

  it "matches type name containing number" do
    parse("Ext.fx2.Anim").should == true
  end

  it "matches array of simple types" do
    parse("Number[]").should == true
  end

  it "matches array of namespaced types" do
    parse("Ext.form.Panel[]").should == true
  end

  it "matches 2D array" do
    parse("String[][]").should == true
  end

  it "matches 3D array" do
    parse("String[][][]").should == true
  end

  describe "matches alteration of" do
    it "simple types" do
      parse("Number/String").should == true
    end

    it "literals" do
      parse("'foo'/'bar'/32/4").should == true
    end

    it "simple- and namespaced- and array types" do
      parse("Number/Ext.form.Panel/String[]/RegExp/Ext.Element").should == true
    end
  end

  describe "matches varargs of" do
    it "simple type" do
      parse("Number...").should == true
    end

    it "namespaced type" do
      parse("Ext.form.Panel...").should == true
    end

    it "array of simple types" do
      parse("String[]...").should == true
    end

    it "array of namespaced types" do
      parse("Ext.form.Panel[]...").should == true
    end

    it "complex alteration" do
      parse("Ext.form.Panel[]/Number/Ext.Element...").should == true
    end

    it "in the middle" do
      parse("Number.../String").should == true
    end
  end

  describe "doesn't match" do
    it "empty string" do
      parse("").should == false
    end

    it "unknown type name" do
      parse("Blah").should == false
    end

    it "type ending with dot" do
      parse("Ext.").should == false
    end

    it "type beginning with dot" do
      parse(".Ext").should == false
    end

    it "the [old] array notation" do
      parse("[Number]").should == false
    end

    it "/ at the beginning" do
      parse("/Number").should == false
    end

    it "/ at the end" do
      parse("Number/").should == false
    end
  end

  # Type expressions supported by closure compiler:
  # https://developers.google.com/closure/compiler/docs/js-for-compiler#types
  describe "supporting closure compiler" do

    it "matches the ALL type" do
      parse("*").should == true
    end

    describe "varargs" do
      it "matches the notation at the beginning" do
        parse("...String").should == true
      end

      it "doesn't accept notation without a type name" do
        parse("...").should == false
      end

      it "doesn't accept both notations at the same time" do
        parse("...*...").should == false
      end
    end

    it "matches the nullable notation" do
      parse("?String").should == true
    end

    it "matches the non-nullable notation" do
      parse("!String").should == true
    end

    it "doesn't accept both nullable and non-nullable at the same time" do
      parse("?!String").should == false
      parse("!?String").should == false
    end

    describe "alteration" do
      it "matches pipes" do
        parse("String|Number|RegExp").should == true
      end

      it "matches with extra spacing" do
        parse(" String | Number ").should == true
      end
    end

    describe "union" do
      it "matches one simple type" do
        parse("(String)").should == true
      end

      it "matches two simple types" do
        parse("(String|Number)").should == true
      end

      it "matches in varargs context" do
        parse("...(String|Number)").should == true
      end

      it "natches with nested union" do
        parse("(String|(Number|RegExp))").should == true
      end

      it "matches with extra spacing" do
        parse("( String | Number )").should == true
      end
    end

    # This is handled inside DocParser, when it's detected over there
    # the "=" is removed from the end of type definition, so it should
    # never reach TypeParser if there is just one "=" at the end of
    # type definition.
    #
    # We do support the optional notation inside function type
    # parameter lists (see below).
    it "doesn't accept optional parameter notation" do
      parse("String=").should == false
    end

    describe "type arguments" do
      it "matches single" do
        parse("Array.<Number>").should == true
      end

      it "matches multiple" do
        parse("Ext.Element.<String,Number>").should == true
      end

      it "matches with extra spacing" do
        parse("Ext.Element.< String , Number >").should == true
      end

      it "matches with nested type arguments" do
        parse("Array.<Array.<String>|Array.<Number>>").should == true
      end

      it "doesn't accept on type union" do
        parse("(Array|RegExp).<String>").should == false
      end

      it "doesn't accept empty" do
        parse("Array.<>").should == false
      end
    end

    describe "function type" do
      it "matches empty" do
        parse("function()").should == true
      end

      it "matches arguments" do
        parse("function(String,Number)").should == true
      end

      it "matches return type" do
        parse("function():Number").should == true
      end

      it "matches with varargs" do
        parse("function(...Number)").should == true
      end

      # For some reason Google Closure Compiler requires varargs type
      # in function argument context to be wrapped inside [] brackets.
      it "matches ...[] varargs syntax" do
        parse("function(...[String])").should == true
      end

      it "matches nullable/non-nullable arguments" do
        parse("function(!String, ?Number)").should == true
      end

      it "matches optional argument" do
        parse("function(Number=)").should == true
      end

      it "matches this: argument" do
        parse("function(this:Array, Number)").should == true
      end

      it "matches new: argument" do
        parse("function(new:Array)").should == true
      end

      it "matches this: argument + ws" do
        parse("function(this : Array, Number)").should == true
      end

      it "matches new: argument + ws" do
        parse("function(new : Array)").should == true
      end

      it "matches with extra whitespace" do
        parse("function(  ) : Array").should == true
      end
    end

    describe "record type" do
      it "matches list of properties" do
        parse("{foo, bar, baz}").should == true
      end

      it "matches properties with types" do
        parse("{foo: String, bar: Number}").should == true
      end

      it "matches property with complex type" do
        parse("{foo: (String|Array.<String>)}").should == true
      end

      it "matches nested record type" do
        parse("{foo: {bar}}").should == true
      end
    end

    it "always matches primitive types" do
      parse("boolean").should == true
      parse("number").should == true
      parse("string").should == true
      parse("null").should == true
      parse("undefined").should == true
      parse("void").should == true
    end

    it "links primitive types to classes" do
      relations = JsDuck::Relations.new([JsDuck::Class.new({:name => "String"})])
      doc_formatter = JsDuck::DocFormatter.new(relations)
      p = JsDuck::TypeParser.new(relations, doc_formatter)
      p.parse("string")
      p.out.should == '<a href="String">string</a>'
    end

    def parse_to_output(input)
      relations = JsDuck::Relations.new([])
      p = JsDuck::TypeParser.new(relations)
      p.parse(input)
      return p.out
    end

    it "preserves whitespace in output" do
      parse_to_output("( string | number )").should == "( string | number )"
    end

    it "converts < and > to HTML entities in output" do
      parse_to_output("number.<string, *>").should == "number.&lt;string, *&gt;"
    end

    it "preserves function notation in output" do
      input = 'function(this:string, ?number=, !number, ...[number]): boolean'
      parse_to_output(input).should == input
    end

    it "preserves object literal notation in output" do
      input = '{myNum: number, myObject}'
      parse_to_output(input).should == input
    end

  end

end
