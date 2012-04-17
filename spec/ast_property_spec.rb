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

  describe "value type in var initialized with" do
    it "int" do
      detect("/** */ var foo = 5;")[:value_type].should == "Number"
    end

    it "float" do
      detect("/** */ var foo = 0.5;")[:value_type].should == "Number"
    end

    it "string" do
      detect("/** */ var foo = 'haa';")[:value_type].should == "String"
    end

    it "true" do
      detect("/** */ var foo = true;")[:value_type].should == "Boolean"
    end

    it "false" do
      detect("/** */ var foo = false;")[:value_type].should == "Boolean"
    end

    it "array" do
      detect("/** */ var foo = [];")[:value_type].should == "Array"
    end

    it "object" do
      detect("/** */ var foo = {};")[:value_type].should == "Object"
    end
  end

  describe "no value type in" do
    it "uninitialized var declaration" do
      detect("/** */ var foo;")[:value_type].should == nil
    end
  end

end
