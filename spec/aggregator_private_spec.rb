require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  describe "@private" do
    before do
      @doc = parse("/** @private */")[0]
    end

    it "marks item as private" do
      @doc[:private].should == true
    end
  end

  describe "@hide" do
    before do
      @doc = parse("/** @hide */")[0]
    end

    it "does not mark item as private" do
      @doc[:private].should_not == true
    end

    it "marks item as :hide" do
      @doc[:hide].should == true
    end
  end

end
