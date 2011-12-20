require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
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
    it "default return type is undefined" do
      @doc[:return][:type].should == "undefined"
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

  describe "function-literal in comma-first style" do
    before do
      @doc = parse("/** Some function */ , foo: function() {}")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "Ext.emptyFn in object-literal" do
    before do
      @doc = parse("/** Some function */ foo: Ext.emptyFn")[0]
    end
    it_should_behave_like "method documentation"
  end

  describe "anonymous function" do
    before do
      @doc = parse("/** Some function */ function() {}")[0]
    end

    it "detects method" do
      @doc[:tagname].should == :method
    end

    it "detects empty method name" do
      @doc[:name].should == ""
    end
  end

  describe "doc-comment followed by 'function'" do
    before do
      @doc = parse("/** Some function */ 'function';")[0]
    end

    it "isn't detected as method" do
      @doc[:tagname].should_not == :method
    end
  end

  describe "explicit @method without @param-s" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some function
         */
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "no parameters"
    it_should_behave_like "no return"
  end

  describe "explicit @method with @param-s" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some function
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         */
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
    it_should_behave_like "no return"
  end

  describe "explicit @method after @params-s" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         * @method foo
         */
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
    it_should_behave_like "no return"
  end

  describe "explicit @method with @param-s overriding implicit code" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         * @method foo
         */
        function bar(q, z) {}
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
  end

  describe "@param-s partially overriding implicit params" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {String} x
         * @param {Number} y
         */
        function foo(q, v, z) {}
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
  end

  describe "@param-s declaring only types" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {String}
         * @param {Number}
         */
        function foo(x, y) {}
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
  end

  describe "@return documenting return value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @return {String} return value
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "has return"
  end

  describe "@returns being alias for @return" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @returns {String} return value
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "method documentation"
    it_should_behave_like "has return"
  end

  describe "Doc-comment not followed by function but containing @return" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @returns {String} return value
         */
        var foo = Ext.emptyFn;
      EOS
    end
    it_should_behave_like "method documentation"
  end

  describe "Doc-comment not followed by function but containing @param" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {String} x
         */
        var foo = Ext.emptyFn;
      EOS
    end
    it_should_behave_like "method documentation"
  end

  describe "method without doc-comment" do
    before do
      @docs = parse(<<-EOS)
        // My comment
        function foo(x, y) {}
      EOS
    end
    it "remains undocumented" do
      @docs.length.should == 0
    end
  end

  shared_examples_for "event documentation" do
    it "creates event" do
      @doc[:tagname].should == :event
    end

    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Fires when needed."
    end

    it "detects event name" do
      @doc[:name].should == "mousedown"
    end
  end

  describe "explicit event with name and @params" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event mousedown
         * Fires when needed.
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         */
      EOS
    end
    it_should_behave_like "event documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
  end

  describe "event with @event after @params" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Fires when needed.
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         * @event mousedown
         */
      EOS
    end
    it_should_behave_like "event documentation"
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
    it_should_behave_like "parameter docs"
  end

  describe "implicit event name as string" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event
         * Fires when needed.
         */
        "mousedown"
      EOS
    end
    it_should_behave_like "event documentation"
    it_should_behave_like "no parameters"
  end

  describe "implicit event name as object property" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event
         * Fires when needed.
         */
        mousedown: true,
      EOS
    end
    it_should_behave_like "event documentation"
    it_should_behave_like "no parameters"
  end

end
