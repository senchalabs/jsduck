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

end

