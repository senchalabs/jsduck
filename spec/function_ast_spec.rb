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

  it "true when RETURN THIS after an IF without RETURNs" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          if (condition) {
              doSomething();
          } else {
              if (cond2) foo();
          }
          return this;
      }
    EOJS
  end

  it "true when RETURN THIS after SWITCH without returns" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          switch (x) {
              case 1: break;
              case 2: break;
              default: foo();
          }
          return this;
      }
    EOJS
  end

  it "true when RETURN THIS after loops without returns" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          for (i=0; i<10; i++) {
              for (j in i) {
                  doBlah();
              }
          }
          while (hoo) {
            do {
              sasa();
            } while(boo);
          }
          return this;
      }
    EOJS
  end

  it "true when RETURN THIS after TRY CATCH without returns" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          try {
            foo();
          } catch (e) {
            bar();
          } finally {
            baz();
          }
          return this;
      }
    EOJS
  end

  it "true when RETURN THIS after WITH & BLOCK without returns" do
    chainable?(<<-EOJS).should == true
      /** */
      function foo() {
          with (x) {
            foo();
          }
          tada: {
            bar();
          }
          return this;
      }
    EOJS
  end

  it "false when RETURN THIS after statements containing a RETURN" do
    chainable?(<<-EOJS).should == false
      /** */
      function foo() {
          while (x) {
            if (foo) {
            } else if (ooh) {
              return whoKnowsWhat;
            }
          }
          return this;
      }
    EOJS
  end

end
