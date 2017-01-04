require "jsduck/ast"
require "jsduck/js_parser"

describe "JsDuck::Ast detecting" do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])
  end

  describe "Ext.define()" do
    let (:members) do
      detect(<<-EOS)[:members]
        /** */
        Ext.define('MyClass', {
            config: {
                foo: true,
                bar: 5
            }
        });
      EOS
    end

    it "adds :members as array" do
      members.should be_kind_of(Array)
    end

    it "finds two cfgs" do
      members[0][:tagname].should == :cfg
      members[1][:tagname].should == :cfg
    end

    it "finds cfg foo" do
      members[0][:name].should == "foo"
    end

    it "finds cfg bar" do
      members[1][:name].should == "bar"
    end
  end

end
