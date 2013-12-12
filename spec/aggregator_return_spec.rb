require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
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
