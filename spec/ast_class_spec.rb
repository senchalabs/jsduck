require "jsduck/ast"
require "jsduck/esprima_parser"

describe "JsDuck::Ast detects class with" do
  def detect(string)
    node = JsDuck::EsprimaParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])
  end

  describe "name in" do
    it "function declaration" do
      detect("/** */ function MyClass() {}")[:name].should == "MyClass"
    end

    it "function assignment" do
      detect("/** */ MyClass = function() {}")[:name].should == "MyClass"
    end

    it "function assignment to property" do
      detect("/** */ foo.MyClass = function() {}")[:name].should == "foo.MyClass"
    end

    it "var initialization with function" do
      detect("/** */ var MyClass = function() {}")[:name].should == "MyClass"
    end

    it "Ext.extend() assignment" do
      detect("/** */ MyClass = Ext.extend(Your.Class, {  });")[:name].should == "MyClass"
    end

    it "var initialized with Ext.extend()" do
      detect("/** */ var MyClass = Ext.extend(Your.Class, {  });")[:name].should == "MyClass"
    end

    it "Ext.define()" do
      detect(<<-EOS)[:name].should == "MyClass"
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end
  end

end
