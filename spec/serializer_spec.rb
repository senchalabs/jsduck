require "jsduck/esprima"
require "jsduck/serializer"

describe JsDuck::Serializer do
  def to_s(string)
    ast = JsDuck::Esprima.instance.parse(string)
    return JsDuck::Serializer.new.to_s(ast)
  end

  def test(string)
    to_s(string).should == string
  end

  describe "serializes" do
    it "empty program" do
      test("")
    end

    it "number" do
      test('15.6;')
    end

    it "string" do
      test('"haa";')
    end

    it "boolean true" do
      test('true;')
    end

    it "boolean false" do
      test('true;')
    end

    it "null" do
      test('null;')
    end

    it "regex" do
      test('/abc/g;')
    end

    it "function declaration" do
      test("function foo(a, b, c) {return 0;}")
    end

    it "variable declaration" do
      test("var foo, bar = 5;")
    end

    it "variable declaration with let" do
      test("let foo = true;")
    end

    it "assignment of function expression" do
      test("foo = function (a) {};")
    end

    it "member expression with this" do
      test("this.foo.bar;")
    end

    it "computed member expression" do
      test("foo[bar];")
    end

    it "+= assignment" do
      test("x += 15;")
    end

    it "method call on array" do
      test("[1, 2, 3].map(max);")
    end

    it "object expression" do
      test("x = {foo: 10, bar: 42};")
    end

    it "new expression" do
      test("new Item();")
    end

    it "logical expression" do
      test("true || false;")
    end

    it "binary expression" do
      test("1 + 2 - 3;")
    end

    it "sequence expression" do
      test("foo, bar;")
    end

    it "update expression" do
      test("++c + c--;")
    end

    it "if statement" do
      test("if (true) alert(5);")
    end

    it "if else statement" do
      test("if (true) {} else {foo();}")
    end

    it "else if statement" do
      test("if (true) {} else if (false) {}")
    end

    it "switch statement" do
      test("switch (foo) {case 1: case 2: alert(1);break;default: alert(2);}")
    end

    it "empty return statement" do
      test("function foo() {return ;}")
    end

    it "for statement" do
      test("for (var i = 0; i < 10; i++) {}")
    end

    it "empty for statement" do
      test("for (; ; ) ;")
    end

    it "for in statement" do
      test("for (var key in obj) {}")
    end

    it "while statement" do
      test("while (true) {break;continue;}")
    end

    it "do while statement" do
      test("do {alert();} while (true);")
    end

    it "labeled statement" do
      test("foo: while (1) {break foo;continue foo;}")
    end

    it "debugger statement" do
      test("debugger;")
    end

    it "try catch statement" do
      test("try {throw foo;} catch (e) {alert(e);}")
    end

    it "try catch statement with empty catch" do
      test("try {} catch () {}")
    end

    it "try finally statement" do
      test("try {} finally {}")
    end

    it "with statement" do
      test("with (obj) {}")
    end
  end

  describe "adds parenthesis correctly on" do
    it "conditional expression" do
      test("(foo = true) ? 1 : 2;")
    end

    it "binary expression" do
      test("3 * (5 + 1);")
    end

    it "logical expression" do
      test("foo && (bar || baz);")
    end

    it "unary expression" do
      test("!(bar || baz);")
    end

    it "call expression" do
      test("(foo || bar)();")
    end

    it "member expression" do
      test("(foo || bar).baz;")
    end

    it "new expression" do
      test("new (Foo || Bar)();")
    end
  end

end
