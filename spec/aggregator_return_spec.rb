require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  describe "method without @return" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         */
        function foo() {}
      EOS
    end
    it "defaults return type to undefined" do
      @doc[:return][:type].should == "undefined"
    end
  end

  describe "method with @return that has no type" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @return Some value.
         */
        function foo() {}
      EOS
    end
    it "defaults return type to Object" do
      @doc[:return][:type].should == "Object"
    end
    it "recognizes documentation of return value" do
      @doc[:return][:doc].should == "Some value."
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
    it_should_behave_like "has return"
  end

end
