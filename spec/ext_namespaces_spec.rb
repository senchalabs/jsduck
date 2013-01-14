require "jsduck/js/parser"
require "jsduck/js/ast"
require "jsduck/js/ext_patterns"

describe "--ext-namespaces=Ext,MyNs,MyNs.Foo.Bar" do
  before do
    JsDuck::Js::ExtPatterns.set(["Ext", "MyNs", "MyNs.Foo.Bar"])
  end

  after do
    JsDuck::Js::ExtPatterns.set(["Ext"])
  end

  def parse(string)
    docs = JsDuck::Js::Parser.new(string).parse
    JsDuck::Js::Ast.new(docs).detect_all!
  end

  it "allows detecting Ext.define()" do
    parse("/** */ Ext.define('MyClass', {});")[0][:code][:tagname].should == :class
  end

  it "allows detecting MyNs.define()" do
    parse("/** */ MyNs.define('MyClass', {});")[0][:code][:tagname].should == :class
  end

  it "allows detecting MyNs.Foo.Bar.define()" do
    parse("/** */ MyNs.Foo.Bar.define('MyClass', {});")[0][:code][:tagname].should == :class
  end

end
