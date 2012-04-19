require "jsduck/ast"
require "jsduck/esprima_parser"

describe "JsDuck::Ast detecting" do
  def detect(string)
    node = JsDuck::EsprimaParser.new(string).parse[0]
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

    it "adds :members as hash" do
      members.should be_kind_of(Hash)
    end

    let(:cfg) { members[:cfg] }

    it "finds :cfg as array" do
      cfg.should be_kind_of(Array)
    end

    it "finds two cfgs with :cfg tagname" do
      cfg[0][:tagname].should == :cfg
      cfg[1][:tagname].should == :cfg
    end

    it "finds cfg foo" do
      cfg[0][:name].should == "foo"
    end

    it "finds cfg bar" do
      cfg[1][:name].should == "bar"
    end
  end

end
