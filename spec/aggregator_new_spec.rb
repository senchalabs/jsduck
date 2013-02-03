require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "method with @new" do
    let(:doc) do
      parse_member(<<-EOS)
        /**
         * Some function
         * @new
         */
        function bar() {}
      EOS
    end

    it "gets the :new flag set" do
      doc[:new].should == true
    end
  end

end
