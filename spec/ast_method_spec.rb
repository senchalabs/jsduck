require "jsduck/ast"
require "jsduck/js_parser"

describe "JsDuck::Ast detects method with" do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
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

    it "function expression with name" do
      detect("/** */ (function foo(){})")[:name].should == "foo"
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

  describe "no params in" do
    it "function declaration without params" do
      detect("/** */ function foo() {}")[:params].length.should == 0
    end

    it "Ext.emptyFn assignment" do
      detect("/** */ foo = Ext.emptyFn")[:params].length.should == 0
    end
  end

  describe "one param in" do
    it "function declaration with one param" do
      detect("/** */ function foo(x) {}")[:params].length.should == 1
    end
  end

  describe "two params in" do
    it "function assignment with two params" do
      detect("/** */ foo = function(a,b){}")[:params].length.should == 2
    end
  end

  describe "param names" do
    it "function assignment with three params" do
      params = detect("/** */ foo = function(a, b, c){}")[:params]
      params[0].should == {:name => "a"}
      params[1].should == {:name => "b"}
      params[2].should == {:name => "c"}
    end
  end

end
