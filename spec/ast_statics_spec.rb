require "jsduck/ast"
require "jsduck/js_parser"

describe "JsDuck::Ast detecting" do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])
  end

  describe "Ext.define()" do
    let (:statics) do
      detect(<<-EOS)[:statics]
        /** */
        Ext.define('MyClass', {
            statics: {
                foo: true,
                bar: function(){}
            }
        });
      EOS
    end

    it "adds :statics as array" do
      statics.should be_kind_of(Array)
    end

    describe "finds static property" do
      it "with :property tagname" do
        statics[0][:tagname].should == :property
      end
      it "with name" do
        statics[0][:name].should == "foo"
      end
      it "with :static flag" do
        statics[0][:meta][:static].should == true
      end
    end

    describe "finds static method" do
      it "with :property tagname" do
        statics[1][:tagname].should == :method
      end
      it "with name" do
        statics[1][:name].should == "bar"
      end
      it "with :static flag" do
        statics[1][:meta][:static].should == true
      end
    end

  end

end
