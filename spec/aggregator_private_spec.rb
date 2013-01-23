require "mini_parser"

describe JsDuck::Aggregator do

  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "@private" do
    before do
      @doc = parse_member("/** @private */")
    end

    it "marks item as private" do
      @doc[:private].should == true
    end
  end

  describe "@hide" do
    before do
      @doc = parse_member("/** @hide */")
    end

    it "does not mark item as private" do
      @doc[:private].should_not == true
    end

    it "marks item as :hide" do
      @doc[:hide].should == true
    end
  end

end
