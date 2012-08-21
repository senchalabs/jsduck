require "jsduck/js_parser"
require "jsduck/function_ast"

describe "JsDuck::FunctionAst#returns" do
  def returns(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::FunctionAst.new.returns(node[:code])
  end

  it "fails when no AST given at all" do
    returns("/** */").should == nil
  end

  it "fails when no function AST given" do
    returns("/** */ Ext.emptyFn;").should == nil
  end

  it "fails when body has no return statement." do
    returns("/** */ function foo() {}").should == nil
  end

  it "returns this when single return this statement in body" do
    returns("/** */ function foo() {return this;}").should == "this"
  end

  it "returns this when return this after a few expression statements" do
    returns(<<-EOJS).should == "this"
      /** */
      function foo() {
          doSomething();
          i++;
          truthy ? foo() : bar();
          return this;
      }
    EOJS
  end

  it "returns this when return this after a few declarations" do
    returns(<<-EOJS).should == "this"
      /** */
      function foo() {
          var x = 10;
          function blah() {
          }
          return this;
      }
    EOJS
  end

end
