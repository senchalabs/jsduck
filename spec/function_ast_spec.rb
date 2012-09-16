require "jsduck/js_parser"
require "jsduck/function_ast"

describe "JsDuck::FunctionAst#return_types" do
  def returns(string)
    node = JsDuck::JsParser.new(string).parse[0]
    return JsDuck::FunctionAst.return_types(node[:code])
  end

  describe "returns [:this] when function body" do
    it "has single RETURN THIS statement in body" do
      returns("/** */ function foo() {return this;}").should == [:this]
    end

    it "has RETURN THIS after a few expression statements" do
      returns(<<-EOJS).should == [:this]
      /** */
      function foo() {
          doSomething();
          i++;
          truthy ? foo() : bar();
          return this;
      }
      EOJS
    end

    it "has RETURN THIS after a few declarations" do
      returns(<<-EOJS).should == [:this]
      /** */
      function foo() {
          var x = 10;
          function blah() {
          }
          return this;
      }
      EOJS
    end

    it "has RETURN THIS after an IF without RETURNs" do
      returns(<<-EOJS).should == [:this]
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

    it "has RETURN THIS after SWITCH without returns" do
      returns(<<-EOJS).should == [:this]
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

    it "has RETURN THIS after loops without returns" do
      returns(<<-EOJS).should == [:this]
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

    it "has RETURN THIS after TRY CATCH without returns" do
      returns(<<-EOJS).should == [:this]
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

    it "has RETURN THIS after WITH & BLOCK without returns" do
      returns(<<-EOJS).should == [:this]
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

    it "has RETURN THIS after statements also containing a RETURN THIS" do
      returns(<<-EOJS).should == [:this]
      /** */
      function foo() {
          while (x) {
            if (foo) {
            } else if (ooh) {
              return this;
            }
          }
          return this;
      }
      EOJS
    end

    it "has both branches of IF finishing with RETURN THIS" do
      returns(<<-EOJS).should == [:this]
      /** */
      function foo() {
          if (foo) {
              blah();
              if (true) {
                  return this;
              } else {
                  chah();
                  return this;
              }
          } else {
              return this;
          }
      }
      EOJS
    end

    it "has DO WHILE containing RETURN THIS" do
      returns(<<-EOJS).should == [:this]
      /** */
      function foo() {
          do {
              return this;
          } while(true);
      }
      EOJS
    end
  end

  describe "doesn't return [:this] when function body" do
    it "is empty" do
      returns("/** */ function foo() {}").should_not == [:this]
    end

    it "has empty return statement" do
      returns("/** */ function foo() { return; }").should_not == [:this]
    end

    it "has RETURN THIS after statements containing a RETURN" do
      returns(<<-EOJS).should_not == [:this]
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

    it "has WHILE containing RETURN THIS" do
      returns(<<-EOJS).should_not == [:this]
      /** */
      function foo() {
          while (condition) {
              return this;
          };
      }
      EOJS
    end

    it "has only one branch finishing with RETURN THIS" do
      returns(<<-EOJS).should_not == [:this]
      /** */
      function foo() {
          if (foo) {
              doSomething();
          } else {
              return this;
          }
      }
      EOJS
    end
  end

  describe "returns ['undefined'] when function body" do
    it "is empty" do
      returns("/** */ function foo() {}").should == ["undefined"]
    end

    it "has no return statement" do
      returns("/** */ function foo() { bar(); baz(); }").should == ["undefined"]
    end

    it "has empty return statement" do
      returns("/** */ function foo() { return; }").should == ["undefined"]
    end

    it "has RETURN UNDEFINED statement" do
      returns("/** */ function foo() { return undefined; }").should == ["undefined"]
    end

    it "has RETURN VOID statement" do
      returns("/** */ function foo() { return void(blah); }").should == ["undefined"]
    end
  end

end
