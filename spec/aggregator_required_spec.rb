require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "a normal config option" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @cfg foo Something
         */
      EOS
    end
    it "is not required by default" do
      @doc[:required].should_not == true
    end
  end

  describe "a config option labeled as required" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @cfg foo (required) Something
         */
      EOS
    end
    it "has required flag set to true" do
      @doc[:required].should == true
    end
  end

  describe "a class with @cfg (required)" do
    before do
      @doc = parse(<<-EOS)["MyClass"]
        /**
         * @class MyClass
         * @cfg foo (required)
         */
      EOS
    end
    it "doesn't become a required class" do
      @doc[:required].should_not == true
    end
    it "contains required config" do
      @doc[:members][0][:required].should == true
    end
  end

end
