require "jsduck/doc_type"
require "jsduck/esprima_parser"
require "jsduck/css_parser"
require "jsduck/doc_parser"

describe JsDuck::DocType do
  def detect(string, type = :js)
    if type == :css
      node = JsDuck::CssParser.new(string).parse[0]
    else
      node = JsDuck::EsprimaParser.new(string).parse[0]
    end

    doc_parser = JsDuck::DocParser.new
    node[:comment] = doc_parser.parse(node[:comment])
    return JsDuck::DocType.new.detect(node[:comment], node[:code])
  end

  describe "detects as class" do
    it "@class tag" do
      detect("/** @class */").should == :class
    end

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

    it "Ext.extend()" do
      detect("/** */ MyClass = Ext.extend(Your.Class, {  });").should == :class
    end

    it "var initialized with Ext.extend()" do
      detect("/** */ var MyClass = Ext.extend(Your.Class, {  });").should == :class
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
    it "@method tag" do
      detect("/** @method */").should == :method
    end

    it "function beginning with underscore" do
      detect("/** */ function _Foo() {}").should == :method
    end

    it "lowercase function name" do
      detect("/** */ function foo() {}").should == :method
    end

    it "assignment of function" do
      detect("/** */ foo = function() {}").should == :method
    end

    it "var initialized with function" do
      detect("/** */ var foo = function() {}").should == :method
    end
  end

  describe "detects as event" do
    it "@event tag" do
      detect("/** @event */").should == :event
    end
  end

  describe "detects as config" do
    it "@cfg tag" do
      detect("/** @cfg */").should == :cfg
    end
  end

  describe "detects as property" do
    it "@property tag" do
      detect("/** @property */").should == :property
    end

    it "@type tag" do
      detect("/** @type Foo */").should == :property
    end

    it "empty doc-comment with no code" do
      detect("/** */").should == :property
    end
  end

  describe "detects as css variable" do
    it "@var tag" do
      detect("/** @var */").should == :css_var
    end
  end

  describe "detects as css mixin" do
    it "@mixin in code" do
      detect("/** */ @mixin foo-bar {}", :css).should == :css_mixin
    end
  end

end
