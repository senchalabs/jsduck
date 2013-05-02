require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_calls(string)
    parse(string)["global"][:members][0][:method_calls]
  end

  describe "function with method calls in code" do
    let(:calls) do
      parse_calls(<<-EOS)
        /** */
        function bar() {
            this.bar();
            this.foo();
        }
      EOS
    end

    it "detects these method calls" do
      calls.should == ["bar", "foo"]
    end
  end

end
