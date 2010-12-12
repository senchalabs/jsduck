require "jsduck/aggregator"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.parse(string)
    agr.result
  end

  shared_examples_for "method documentation" do
    it "creates method" do
      @doc[:tagname].should == :method
    end

    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Some function"
    end

    it "detects method name" do
      @doc[:name].should == "foo"
    end
  end

  shared_examples_for "no parameters" do
    it "by default methods have no parameters" do
      @doc[:params].length.should == 0
    end
  end

  shared_examples_for "two parameters" do
    it "detects parameter count" do
      @doc[:params].length.should == 2
    end

    it "detects parameter names" do
      @doc[:params][0][:name].should == "x"
      @doc[:params][1][:name].should == "y"
    end
  end

  shared_examples_for "parameter types" do
    it "detects parameter types" do
      @doc[:params][0][:type].should == "String"
      @doc[:params][1][:type].should == "Number"
    end
  end

  shared_examples_for "parameter default types" do
    it "parameter default type is Ibject" do
      @doc[:params][0][:type].should == "Object"
      @doc[:params][1][:type].should == "Object"
    end
  end

  shared_examples_for "parameter docs" do
    it "detects parameter types" do
      @doc[:params][0][:doc].should == "First parameter"
      @doc[:params][1][:doc].should == "Second parameter"
    end
  end

  shared_examples_for "no return" do
    it "default return type is void" do
      @doc[:return][:type].should == "void"
    end
  end

  shared_examples_for "has return" do
    it "detects return type" do
      @doc[:return][:type].should == "String"
    end
    it "detects return value comment" do
      @doc[:return][:doc].should == "return value"
    end
  end

  describe "function declaration" do
    before do
      @doc = parse("/** Some function */ function foo() {}")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "no parameters"
    it_should_behave_like "no return"
  end

  describe "function declaration with parameters" do
    before do
      @doc = parse("/** Some function */ function foo(x, y) {}")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter default types"
    it_should_behave_like "no return"
  end

  describe "function-literal with var" do
    before do
      @doc = parse("/** Some function */ var foo = function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "function-literal without var" do
    before do
      @doc = parse("/** Some function */ foo = function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "function-literal in object-literal" do
    before do
      @doc = parse("/** Some function */ foo: function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "function-literal in object-literal-string" do
    before do
      @doc = parse("/** Some function */ 'foo': function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "function-literal in prototype-chain" do
    before do
      @doc = parse("/** Some function */ Some.long.prototype.foo = function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "explicit @method without @param-s" do
    before do
      @doc = parse("
/**
 * @method foo
 * Some function
 */")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "no parameters"
    it_should_behave_like "no return"
  end

  describe "explicit @method with @param-s" do
    before do
      @doc = parse("
/**
 * @method foo
 * Some function
 * @param {String} x First parameter
 * @param {Number} y Second parameter
 */")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
    it_should_behave_like "no return"
  end

  describe "explicit @method after @params-s" do
    before do
      @doc = parse("
/**
 * Some function
 * @param {String} x First parameter
 * @param {Number} y Second parameter
 * @method foo
 */")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
    it_should_behave_like "no return"
  end

  describe "explicit @method with @param-s overriding implicit code" do
    before do
      @doc = parse("
/**
 * Some function
 * @param {String} x First parameter
 * @param {Number} y Second parameter
 * @method foo
 */
function bar(q, z) {}
")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
  end

  describe "@param-s partially overriding implicit params" do
    before do
      @doc = parse("
/**
 * Some function
 * @param {String} x
 */
function foo(q, y) {}
")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
  end

  describe "@param-s declaring only types" do
    before do
      @doc = parse("
/**
 * Some function
 * @param {String}
 * @param {Number}
 */
function foo(x, y) {}
")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
  end

  describe "@return documenting return value" do
    before do
      @doc = parse("
/**
 * Some function
 * @return {String} return value
 */
function foo() {}
")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "has return"
  end

  describe "@returns being alias for @return" do
    before do
      @doc = parse("
/**
 * Some function
 * @returns {String} return value
 */
function foo() {}
")[0]
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "has return"
  end

  describe "method without doc-comment" do
    before do
      @docs = parse("
// My comment
function foo(x, y) {}
")
    end
    it "remains undocumented" do
      @docs.length.should == 0
    end
  end

  describe "@member" do

    it "defines the class where item belongs" do
      items = parse("
/**
 * @cfg foo
 * @member Bar
 */
")
      items[0][:member].should == "Bar"
    end

    it "forces item to be moved into that class" do
      items = parse("
/**
 * @class Bar
 */
/**
 * @class Baz
 */
/**
 * @cfg foo
 * @member Bar
 */
")
      items[0][:cfg].length.should == 1
      items[1][:cfg].length.should == 0
    end

    it "even when @member comes before the class itself" do
      items = parse("
/**
 * @cfg foo
 * @member Bar
 */
/**
 * @class Bar
 */
")
      items[0][:cfg].length.should == 1
    end
  end

  describe "one class many times" do
    before do
      @classes = parse("
/**
 * @class Foo
 * @cfg c1
 */
  /** @method fun1 */
  /** @event eve1 */
  /** @property prop1 */
/**
 * @class Foo
 * @extends Bar
 * Second description.
 * @xtype xfoo
 * @private
 * @cfg c2
 */
  /** @method fun2 */
  /** @event eve3 */
  /** @property prop2 */
/**
 * @class Foo
 * @extends Bazaar
 * @singleton
 * Third description.
 * @xtype xxxfoo
 * @cfg c3
 */
  /** @method fun3 */
  /** @event eve3 */
  /** @property prop3 */
")
    end

    it "results in only one class" do
      @classes.length.should == 1
    end

    it "takes class doc from first doc-block that has one" do
      @classes[0][:doc].should == "Second description."
    end

    it "takes @extends from first doc-block that has one" do
      @classes[0][:extends].should == "Bar"
    end

    it "takes @xtype from first doc-block that has one" do
      @classes[0][:xtype].should == "xfoo"
    end

    it "is singleton when one doc-block is singleton" do
      @classes[0][:singleton].should == true
    end

    it "is private when one doc-block is private" do
      @classes[0][:private].should == true
    end

    it "combines all configs" do
      @classes[0][:cfg].length.should == 3
    end

    it "combines all methods, events, properties" do
      @classes[0][:method].length.should == 3
      @classes[0][:event].length.should == 3
      @classes[0][:property].length.should == 3
    end
  end

end
