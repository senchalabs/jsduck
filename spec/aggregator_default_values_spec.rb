require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  shared_examples_for "optional parameter" do
    it "makes parameter optional" do
      @param[:optional].should == true
    end

    it "keeps parameter name" do
      @param[:name].should == "foo"
    end

    it "leaves optionality syntax out of description" do
      @param[:doc].should == "Something"
    end
  end

  describe "parameter name followed with (optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo (optional) Something
         */
        function foo() {
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter name followed with mixed-case (Optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo (Optional) Something
         */
        function foo() {
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter name followed with 'optional'" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo optional Something
         */
        function foo() {
      EOS
    end
    it "doesn't make parameter optional" do
      @param[:optional].should == false
    end
  end

  describe "parameter description containing (optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo Something (optional)
         */
        function foo() {
      EOS
    end
    it "doesn't make parameter optional" do
      @param[:optional].should == false
    end
  end

  describe "parameter name in [brackets]" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo] Something
         */
        function foo() {
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter with explicit default value" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo=42] Something
         */
        function foo() {
      EOS
    end
    it_should_behave_like "optional parameter"
    it "has default value" do
      @param[:default].should == "42"
    end
  end

  describe "parameter with explicit long default value" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo="Hello, my dear!"] Something
         */
        function foo() {
      EOS
    end
    it_should_behave_like "optional parameter"
    it "has default value" do
      @param[:default].should == '"Hello, my dear!"'
    end
  end

end
