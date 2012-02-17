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

    it "adds private meta tag" do
      @doc[:meta][:private].should == true
    end
  end

  describe "@private" do
    before { @tagname = "@private" }
    it_should_behave_like "private"
  end

  describe "@ignore" do
    before { @tagname = "@ignore" }
    it_should_behave_like "private"
  end

  describe "@hide" do
    before do
      @doc = parse("/** @hide */")[0]
    end

    it "does not mark item as private" do
      @doc[:private].should_not == true
    end

    it "marks item as :hide" do
      @doc[:meta][:hide].should == true
    end
  end

end
