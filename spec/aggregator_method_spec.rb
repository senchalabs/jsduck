require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "method" do
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

  describe "explicit method" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some function
         */
      EOS
    end
    it_should_behave_like "method"
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
    it_should_behave_like "method"
  end

  describe "explicit @method followed by function with another name" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @method foo
         */
        function bar(x, y) {}
      EOS
    end
    it_should_behave_like "method"
  end

  describe "function declaration" do
    before do
      @doc = parse("/** Some function */ function foo() {}")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal with var" do
    before do
      @doc = parse("/** Some function */ var foo = function() {}")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal without var" do
    before do
      @doc = parse("/** Some function */ foo = function() {}")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal in object-literal" do
    before do
      @doc = parse("({ /** Some function */ foo: function() {} })")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal in object-literal-string" do
    before do
      @doc = parse("({ /** Some function */ 'foo': function() {} })")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal in prototype-chain" do
    before do
      @doc = parse("/** Some function */ Some.long.prototype.foo = function() {}")[0]
    end
    it_should_behave_like "method"
  end

  describe "function-literal in comma-first style" do
    before do
      @doc = parse("({ blah: 7 /** Some function */ , foo: function() {} })")[0]
    end
    it_should_behave_like "method"
  end

  describe "Ext.emptyFn in object-literal" do
    before do
      @doc = parse("({ /** Some function */ foo: Ext.emptyFn })")[0]
    end
    it_should_behave_like "method"
  end

  describe "doc-comment followed by 'function'" do
    before do
      @doc = parse("/** Some function */ 'function';")[0]
    end

    it "isn't detected as method" do
      @doc[:tagname].should_not == :method
    end
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
    it_should_behave_like "method"
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
    it_should_behave_like "method"
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

  shared_examples_for "auto detected method" do
    it "detects a method" do
      method[:tagname].should == :method
    end

    it "detects method name" do
      method[:name].should == 'foo'
    end

    it "flags method with :inheritdoc" do
      method[:inheritdoc].should == {}
    end

    it "flags method as :autodetected" do
      method[:autodetected].should == true
    end
  end

  describe "method without comment inside Ext.define" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        Ext.define("MyClass", {
            foo: function() {}
        });
      EOS
    end

    it_should_behave_like "auto detected method"
  end

  describe "method with line comment inside Ext.define" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        Ext.define("MyClass", {
            // My docs
            foo: function() {}
        });
      EOS
    end

    it_should_behave_like "auto detected method"

    it "detects method documentation" do
      method[:doc].should == 'My docs'
    end
  end

  describe "property with value Ext.emptyFn inside Ext.define" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        Ext.define("MyClass", {
            foo: Ext.emptyFn
        });
      EOS
    end

    it "detects a method" do
      method[:tagname].should == :method
    end
  end

  describe "method without comment inside Ext.extend" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        MyClass = Ext.extend(Object, {
            foo: function(){}
        });
      EOS
    end

    it_should_behave_like "auto detected method"
  end

  describe "method with line comment inside Ext.extend" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        MyClass = Ext.extend(Object, {
            // My docs
            foo: function(){}
        });
      EOS
    end

    it_should_behave_like "auto detected method"

    it "detects method documentation" do
      method[:doc].should == 'My docs'
    end
  end

  describe "method without comment inside object literal" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        MyClass = {
            foo: function(){}
        };
      EOS
    end

    it_should_behave_like "auto detected method"
  end

  describe "method with line comment inside object literal" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /** Some documentation. */
        MyClass = {
            // My docs
            foo: function(){}
        };
      EOS
    end

    it_should_behave_like "auto detected method"

    it "detects method documentation" do
      method[:doc].should == 'My docs'
    end
  end

  describe "method inside object literal marked with @class" do
    let(:method) do
      parse(<<-EOS)[0][:members][0]
        /**
         * @class MyClass
         * Some documentation.
         */
        createClass("MyClass", /** @class MyClass */ {
            foo: function(){}
        });
      EOS
    end

    it_should_behave_like "auto detected method"
  end

end
