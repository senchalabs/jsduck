require "jsduck/js_parser"
require "jsduck/function_ast"

describe "JsDuck::FunctionAst#chainable?" do
  def chainable?(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::FunctionAst.chainable?(node[:code])
  end

  it "false when no AST given at all" do
    chainable?("/** */").should == false
  end

  it "false when no function AST given" do
    chainable?("/** */ Ext.emptyFn;").should == false
  end

  it "false when body has no return statement." do
    chainable?("/** */ function foo() {}").should == false
  end

  it "true when single RETURN THIS statement in body" do
    chainable?("/** */ function foo() {return this;}").should == true
  end

  it "true when RETURN THIS after a few expression statements" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          doSomething();
          i++;
          truthy ? foo() : bar();
          return this;
      }
    EOJS
  end

  it "true when RETURN THIS after a few declarations" do
    chainable?(<<-EOJS).should == true
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
