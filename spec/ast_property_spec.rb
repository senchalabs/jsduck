require "jsduck/ast"
require "jsduck/js_parser"

describe "JsDuck::Ast detects property with" do
  def detect(string)
    node = JsDuck::JsParser.new(string).parse[0]
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

    it "string as function argument" do
      detect(<<-EOS)[:name].should == "foo"
        this.addEvents(
            /** */
            "foo"
        );
      EOS
    end
  end

  describe "type in var initialized with" do
    it "int" do
      detect("/** */ var foo = 5;")[:type].should == "Number"
    end

    it "float" do
      detect("/** */ var foo = 0.5;")[:type].should == "Number"
    end

    it "string" do
      detect("/** */ var foo = 'haa';")[:type].should == "String"
    end

    it "true" do
      detect("/** */ var foo = true;")[:type].should == "Boolean"
    end

    it "false" do
      detect("/** */ var foo = false;")[:type].should == "Boolean"
    end

    it "regex" do
      detect("/** */ var foo = /abc/g;")[:type].should == "RegExp"
    end

    it "array" do
      detect("/** */ var foo = [];")[:type].should == "Array"
    end

    it "object" do
      detect("/** */ var foo = {};")[:type].should == "Object"
    end
  end

  describe "no type in" do
    it "uninitialized var declaration" do
      detect("/** */ var foo;")[:type].should == nil
    end
  end

  describe "default value in" do
    it "var initialization with string" do
      detect("/** */ var foo = 'bar';")[:default].should == "'bar'"
    end

    it "assignment with number" do
      detect("/** */ foo = 15;")[:default].should == "15"
    end

    it "assignment with number 0" do
      detect("/** */ foo = 0;")[:default].should == "0"
    end

    it "assignment with boolean true" do
      detect("/** */ foo = true;")[:default].should == "true"
    end

    it "assignment with boolean false" do
      detect("/** */ foo = false;")[:default].should == "false"
    end

    it "assignment with regex" do
      detect("/** */ foo = /abc/;")[:default].should == "/abc/"
    end

    it "assignment with object" do
      detect("/** */ foo = {bar: 5};")[:default].should == "{bar: 5}"
    end

    it "object property with array" do
      detect("X = { /** */ foo: [1, 2, 3] };")[:default].should == "[1, 2, 3]"
    end
  end

  describe "no default value in" do
    it "var without initialization" do
      detect("/** */ var foo;")[:default].should == nil
    end

    it "assignment of function call" do
      detect("/** */ foo = bar();")[:default].should == nil
    end

    it "object property with array containing function" do
      detect("X = { /** */ foo: [1, 2, function(){}] };")[:default].should == nil
    end
  end

end
