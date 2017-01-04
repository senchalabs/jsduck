require "jsduck/js_parser"
require "jsduck/ast"

describe "--ext-namespaces=Ext,MyNs,MyNs.Foo.Bar" do
  def parse(string)
    docs = JsDuck::JsParser.new(string).parse
    JsDuck::Ast.new(docs, {:ext_namespaces => ["Ext", "MyNs", "MyNs.Foo.Bar"]}).detect_all!
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
