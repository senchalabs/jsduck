require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "Property with @readonly" do
    let(:doc) do
      parse_member("/** @readonly */")
    end

    it "gets readonly attribute" do
      doc[:readonly].should == true
    end
  end

end
