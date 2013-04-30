require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "@fires with single event" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * Some function
         * @fires click
         */
        function bar() {}
      EOS
    end

    it "detects one fired event" do
      @doc[:fires].length.should == 1
    end

    it "detects event name that's fired" do
      @doc[:fires][0].should == "click"
    end
  end

  describe "@fires with multiple events" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @fires click dblclick
         */
        function bar() {}
      EOS
    end

    it "detects two events" do
      @doc[:fires].length.should == 2
    end

    it "detects event names" do
      @doc[:fires][0].should == "click"
      @doc[:fires][1].should == "dblclick"
    end
  end

  describe "multiple @fires tags" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @fires click
         * @fires dblclick
         */
        function bar() {}
      EOS
    end

    it "detects two events" do
      @doc[:fires].length.should == 2
    end

    it "detects event names" do
      @doc[:fires][0].should == "click"
      @doc[:fires][1].should == "dblclick"
    end
  end

end
