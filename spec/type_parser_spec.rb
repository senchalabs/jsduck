require "jsduck/relations"
require "jsduck/type_parser"

describe JsDuck::TypeParser do

  def parse(str)
    relations = JsDuck::Relations.new([], [
      "String",
      "Number",
      "RegExp",
      "Ext.form.Panel",
      "Ext.Element",
      "Ext.fx2.Anim",
    ])
    JsDuck::TypeParser.new(relations).parse(str)
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

    it "matches the varargs notation at the beginning" do
      parse("...String").should == true
    end

    it "doesn't accept varargs notation without a type name" do
      parse("...").should == false
    end

    it "doesn't accept both varargs notations at the same time" do
      parse("...*...").should == false
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

    it "matches alteration with pipe" do
      parse("String|Number|RegExp").should == true
    end

    it "matches union of one simple type" do
      parse("(String)").should == true
    end

    it "matches union of two simple types" do
      parse("(String|Number)").should == true
    end

    it "matches union type in varargs context" do
      parse("...(String|Number)").should == true
    end

    it "matches nested union type" do
      parse("(String|(Number|RegExp))").should == true
    end

    # This is handled inside DocParser, when it's detected over there
    # the "=" is removed from the end of type definition, so it should
    # never reach TypeParser if there is just one "=" at the end of
    # type definition.
    it "doesn't accept optional parameter notation" do
      parse("String=").should == false
    end

  end

end

