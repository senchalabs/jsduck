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

  describe "extends in" do
    it "Ext.extend() assignment" do
      detect("/** */ MyClass = Ext.extend(Your.Class, {  });")[:extends].should == "Your.Class"
    end

    it "var initialized with Ext.extend()" do
      detect("/** */ var MyClass = Ext.extend(Your.Class, {  });")[:extends].should == "Your.Class"
    end

    it "Ext.define() with extend:" do
      detect(<<-EOS)[:extends].should == "Your.Class"
        /** */
        Ext.define('MyClass', {
            extend: "Your.Class"
        });
      EOS
    end

    it "Ext.define() with extend: as second object property" do
      detect(<<-EOS)[:extends].should == "Your.Class"
        /** */
        Ext.define('MyClass', {
            foo: 5,
            extend: "Your.Class"
        });
      EOS
    end
  end

  describe "no extends in" do
    it "Ext.define() with function argument" do
      detect(<<-EOS)[:extends].should == nil
        /** */
        Ext.define('MyClass', function() {
        });
      EOS
    end

    it "Ext.define() with no extend: in config object" do
      detect(<<-EOS)[:extends].should == nil
        /** */
        Ext.define('MyClass', {
            foo: 5,
            bar: "hah"
        });
      EOS
    end
  end

  describe "requries in" do
    it "Ext.define() with requires as string" do
      detect(<<-EOS)[:requires].should == "Other.Class"
        /** */
        Ext.define('MyClass', {
            requires: "Other.Class"
        });
      EOS
    end
  end

end
