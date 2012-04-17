require "jsduck/ast"
require "jsduck/esprima_parser"

describe "JsDuck::Ast detects property with" do
  def detect(string)
    node = JsDuck::EsprimaParser.new(string).parse[0]
    return JsDuck::Ast.new.detect(node[:code])
  end

  describe "name in" do
    it "var declaration" do
      detect("/** */ var foo;")[:name].should == "foo"
    end

    it "var declaration with initialization" do
      detect("/** */ foo = 5;")[:name].should == "foo"
    end

    it "assignment to var" do
      detect("/** */ foo = 5;")[:name].should == "foo"
    end

    it "assignment to object property" do
      detect("/** */ foo.bar.baz = 5;")[:name].should == "foo.bar.baz"
    end

    it "object property" do
      detect(<<-EOS)[:name].should == "foo"
        Foo = {
            /** */
            foo: 5
        };
      EOS
    end

    it "object with string key" do
      detect(<<-EOS)[:name].should == "foo"
        Foo = {
            /** */
            "foo": 5
        };
      EOS
    end

    it "lonely identifier" do
      detect("/** */ foo;")[:name].should == "foo"
    end

    it "lonely string" do
      detect("/** */ 'foo';")[:name].should == "foo"
    end
  end

end
