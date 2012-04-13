require "jsduck/ast"
require "jsduck/esprima_parser"

describe "JsDuck::Ast detects method" do
  def detect(string)
    node = JsDuck::EsprimaParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])
  end

  describe "name in" do
    it "function declaration" do
      detect("/** */ function foo() {}")[:name].should == "foo"
    end

    it "function assignment" do
      detect("/** */ foo = function() {}")[:name].should == "foo"
    end

    it "function assignment to object property" do
      detect("/** */ some.item.foo = Ext.emptyFn")[:name].should == "some.item.foo"
    end

    it "Ext.emptyFn assignment" do
      detect("/** */ foo = Ext.emptyFn")[:name].should == "foo"
    end

    it "var initialized with function" do
      detect("/** */ var foo = function() {}")[:name].should == "foo"
    end

    it "var initialized with Ext.emptyFn" do
      detect("/** */ var foo = Ext.emptyFn")[:name].should == "foo"
    end

    it "object property initialized with function" do
      detect(<<-EOS)[:name].should == "foo"
        Foo = {
            /** */
            foo: function(){}
        };
      EOS
    end

    it "object property initialized with Ext.emptyFn" do
      detect(<<-EOS)[:name].should == "foo"
        Foo = {
            /** */
            foo: Ext.emptyFn
        };
      EOS
    end

    it "object property with string key initialized with function" do
      detect(<<-EOS)[:name].should == "foo"
        Foo = {
            /** */
            "foo": function(){}
        };
      EOS
    end
  end

end
