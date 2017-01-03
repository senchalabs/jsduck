require "jsduck/ast"
require "jsduck/js_parser"

describe JsDuck::Ast do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])[:tagname]
  end

  describe "detects as class" do
    it "function beginning with uppercase letter" do
      detect("/** */ function MyClass() {}").should == :class
    end

    it "function assignment to uppercase name" do
      detect("/** */ MyClass = function() {}").should == :class
    end

    it "function assignment to uppercase property" do
      detect("/** */ foo.MyClass = function() {}").should == :class
    end

    it "uppercase var initialization with function" do
      detect("/** */ var MyClass = function() {}").should == :class
    end

    it "object literal assignment to uppercase name" do
      detect("/** */ MyClass = {};").should == :class
    end

    it "doc-comment right before object literal" do
      detect("MyClass = makeClass( /** */ {} );").should == :class
    end

    it "Ext.extend()" do
      detect("/** */ MyClass = Ext.extend(Your.Class, {  });").should == :class
    end

    it "var initialized with Ext.extend()" do
      detect("/** */ var MyClass = Ext.extend(Your.Class, {  });").should == :class
    end

    it "Ext.extend() assigned to lowercase name" do
      detect("/** */ myclass = Ext.extend(Your.Class, {  });").should == :class
    end

    it "lowercase var initialized with Ext.extend()" do
      detect("/** */ var myclass = Ext.extend(Your.Class, {  });").should == :class
    end

    it "Ext.define()" do
      detect(<<-EOS).should == :class
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end

    it "Ext.ClassManager.create()" do
      detect(<<-EOS).should == :class
        /** */
        Ext.ClassManager.create('MyClass', {
        });
      EOS
    end
  end

  describe "detects as method" do
    it "function beginning with underscore" do
      detect("/** */ function _Foo() {}").should == :method
    end

    it "lowercase function name" do
      detect("/** */ function foo() {}").should == :method
    end

    it "assignment of function" do
      detect("/** */ foo = function() {}").should == :method
    end

    it "assignment of Ext.emptyFn" do
      detect("/** */ foo = Ext.emptyFn").should == :method
    end

    it "var initialized with function" do
      detect("/** */ var foo = function() {}").should == :method
    end

    it "var initialized with Ext.emptyFn" do
      detect("/** */ var foo = Ext.emptyFn").should == :method
    end

    it "anonymous function as expression" do
      detect("/** */ (function(){})").should == :method
    end

    it "anonymous function as parameter" do
      detect("doSomething('blah', /** */ function(){});").should == :method
    end

    it "object property initialized with function" do
      detect(<<-EOS).should == :method
        Foo = {
            /** */
            bar: function(){}
        };
      EOS
    end

    it "object property in comma-first notation initialized with function" do
      detect(<<-EOS).should == :method
        Foo = {
            foo: 5
            /** */
            , bar: function(){}
        };
      EOS
    end

    it "object property initialized with Ext.emptyFn" do
      detect(<<-EOS).should == :method
        Foo = {
            /** */
            bar: Ext.emptyFn
        };
      EOS
    end
  end

  describe "detects as property" do
    it "no code" do
      detect("/** */").should == :property
    end
  end

end
