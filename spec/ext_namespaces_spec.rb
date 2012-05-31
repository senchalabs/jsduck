require "jsduck/js_parser"

describe "--ext-namespaces=Ext,MyNs,MyNs.Foo.Bar" do
  def parse(string)
    JsDuck::JsParser.new(string, {:ext_namespaces => ["Ext", "MyNs", "MyNs.Foo.Bar"]}).parse
  end

  it "allows detecting Ext.define()" do
    parse("/** */ Ext.define('MyClass', {});")[0][:code][:type].should == :ext_define
  end

  it "allows detecting MyNs.define()" do
    parse("/** */ MyNs.define('MyClass', {});")[0][:code][:type].should == :ext_define
  end

  it "allows detecting MyNs.Foo.Bar.define()" do
    parse("/** */ MyNs.Foo.Bar.define('MyClass', {});")[0][:code][:type].should == :ext_define
  end

end
