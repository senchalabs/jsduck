require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  shared_examples_for "private" do
    before do
      @doc = parse("/**\n * #{@tagname}\n */")[0]
    end

    it "marks item as private" do
      @doc[:private].should == true
    end
  end

  describe "@private" do
    before { @tagname = "@private" }
    it_should_behave_like "private"
  end

  describe "@hide" do
    before { @tagname = "@hide" }
    it_should_behave_like "private"
  end

  describe "@ignore" do
    before { @tagname = "@ignore" }
    it_should_behave_like "private"
  end

  describe "@protected" do
    before { @tagname = "@protected" }
    it_should_behave_like "private"
  end

end
