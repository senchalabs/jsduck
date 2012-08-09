require "jsduck/ast"
require "jsduck/js_parser"

describe "JsDuck::Ast detects class with" do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
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

    it "Ext.define() with function argument" do
      detect(<<-EOS)[:extends].should == "Ext.Base"
        /** */
        Ext.define('MyClass', function() {
        });
      EOS
    end

    it "Ext.define() with no extend: in config object" do
      detect(<<-EOS)[:extends].should == "Ext.Base"
        /** */
        Ext.define('MyClass', {
            foo: 5,
            bar: "hah"
        });
      EOS
    end
  end

  describe "no extends in" do
    it "plain variable assignment" do
      detect(<<-EOS)[:extends].should == nil
        /** */
        MyClass = {
            extend: 5
        };
      EOS
    end
  end

  describe "requires in" do
    it "Ext.define() with requires as string" do
      detect(<<-EOS)[:requires].should == ["Other.Class"]
        /** */
        Ext.define('MyClass', {
            requires: "Other.Class"
        });
      EOS
    end

    it "Ext.define() with requires as array of strings" do
      detect(<<-EOS)[:requires].should == ["Some.Class", "Other.Class"]
        /** */
        Ext.define('MyClass', {
            requires: ["Some.Class", "Other.Class"]
        });
      EOS
    end
  end

  describe "no requires in" do
    it "Ext.define() without requires" do
      detect(<<-EOS)[:requires].should == []
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end

    it "Ext.define() with requires as array of functions and strings" do
      detect(<<-EOS)[:requires].should == []
        /** */
        Ext.define('MyClass', {
            requires: [function(){}, "Foo"]
        });
      EOS
    end

    it "Ext.define() with requires as nested array" do
      detect(<<-EOS)[:requires].should == []
        /** */
        Ext.define('MyClass', {
            requires: ["Foo", ["Bar"]]
        });
      EOS
    end
  end

  describe "uses in" do
    # Just a smoke-test here, as it's sharing the implementation of :requires
    it "Ext.define() with uses as array" do
      detect(<<-EOS)[:uses].should == ["Other.Class"]
        /** */
        Ext.define('MyClass', {
            uses: ["Other.Class"]
        });
      EOS
    end
  end

  describe "alternateClassNames in" do
    # Just a smoke-test here, as it's sharing the implementation of :requires
    it "Ext.define() with alternateClassName as string" do
      detect(<<-EOS)[:alternateClassNames].should == ["Other.Class"]
        /** */
        Ext.define('MyClass', {
            alternateClassName: "Other.Class"
        });
      EOS
    end
  end

  describe "mixins in" do
    it "Ext.define() with mixins as string" do
      Set.new(detect(<<-EOS)[:mixins]).should == Set.new(["Some.Class", "Other.Class"])
        /** */
        Ext.define('MyClass', {
            mixins: ["Some.Class", "Other.Class"]
        });
      EOS
    end

    it "Ext.define() with mixins as array of strings" do
      Set.new(detect(<<-EOS)[:mixins]).should == Set.new(["Other.Class"])
        /** */
        Ext.define('MyClass', {
            mixins: "Other.Class"
        });
      EOS
    end

    it "Ext.define() with mixins as object" do
      Set.new(detect(<<-EOS)[:mixins]).should == Set.new(["Some.Class", "Other.Class"])
        /** */
        Ext.define('MyClass', {
            mixins: {
                some: "Some.Class",
                other: "Other.Class"
            }
        });
      EOS
    end
  end

  describe "no mixins in" do
    it "Ext.define() without mixins" do
      detect(<<-EOS)[:mixins].should == []
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end

    it "Ext.define() with mixins as nested object" do
      detect(<<-EOS)[:mixins].should == []
        /** */
        Ext.define('MyClass', {
            mixins: {foo: {bar: "foo"}}
        });
      EOS
    end

    it "Ext.define() with mixins as identifier" do
      detect(<<-EOS)[:mixins].should == []
        /** */
        Ext.define('MyClass', {
            mixins: someVar
        });
      EOS
    end
  end

  describe "singleton in" do
    it "Ext.define() with singleton:true" do
      detect(<<-EOS)[:singleton].should == true
        /** */
        Ext.define('MyClass', {
            singleton: true
        });
      EOS
    end
  end

  describe "no singleton in" do
    it "Ext.define() with singleton:false" do
      detect(<<-EOS)[:singleton].should_not == true
        /** */
        Ext.define('MyClass', {
            singleton: false
        });
      EOS
    end

    it "Ext.define() without singleton" do
      detect(<<-EOS)[:singleton].should_not == true
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end
  end

  describe "aliases in" do
    it "Ext.define() single string alias" do
      detect(<<-EOS)[:aliases].should == ["widget.foo"]
        /** */
        Ext.define('MyClass', {
            alias: "widget.foo"
        });
      EOS
    end

    it "Ext.define() with alias as array" do
      detect(<<-EOS)[:aliases].should == ["widget.foo", "widget.fooeditor"]
        /** */
        Ext.define('MyClass', {
            alias: ["widget.foo", "widget.fooeditor"]
        });
      EOS
    end

    it "Ext.define() with xtype" do
      detect(<<-EOS)[:aliases].should == ["widget.foo"]
        /** */
        Ext.define('MyClass', {
            xtype: "foo"
        });
      EOS
    end

    it "Ext.define() with alias and xtype" do
      detect(<<-EOS)[:aliases].should == ["widget.foo", "widget.fooeditor"]
        /** */
        Ext.define('MyClass', {
            alias: "widget.foo",
            xtype: "fooeditor"
        });
      EOS
    end
  end

end
