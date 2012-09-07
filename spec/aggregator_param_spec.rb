require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "no parameters" do
    it "detects no params" do
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

  describe "explicit @method without @param-s" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some function
         */
      EOS
    end
    it_should_behave_like "no parameters"
  end

  describe "function declaration without params" do
    before do
      @doc = parse("/** Some function */ function foo() {}")[0]
    end
    it_should_behave_like "no parameters"
  end

  describe "function declaration with parameters" do
    before do
      @doc = parse("/** Some function */ function foo(x, y) {}")[0]
    end
    it_should_behave_like "two parameters"
    it "parameter types default to Object" do
      @doc[:params][0][:type].should == "Object"
      @doc[:params][1][:type].should == "Object"
    end
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
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
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
        function foo(q, z) {}
      EOS
    end
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
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
    it_should_behave_like "no parameters"
  end

  describe "explicit @param-s followed by more implicit params" do
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
    it_should_behave_like "two parameters"
    it_should_behave_like "parameter types"
  end
end
