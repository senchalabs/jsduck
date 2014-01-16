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
            statics: {
                foo: true,
                bar: function(){}
            }
        });
      EOS
    end

    it "finds two members" do
      members.length.should == 2
    end

    describe "finds property" do
      it "with :property tagname" do
        members[0][:tagname].should == :property
      end
      it "with name" do
        members[0][:name].should == "foo"
      end
      it "with :static flag" do
        members[0][:meta][:static].should == true
      end
    end

    describe "finds method" do
      it "with :property tagname" do
        members[1][:tagname].should == :method
      end
      it "with name" do
        members[1][:name].should == "bar"
      end
      it "with :static flag" do
        members[1][:meta][:static].should == true
      end
    end

  end

end
