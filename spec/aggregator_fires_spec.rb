require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_fires(string)
    parse(string)["global"][:members][0][:fires].map {|e| e[:name] }
  end

  describe "@fires with single event" do
    before do
      @fires = parse_fires(<<-EOS)
        /**
         * Some function
         * @fires click
         */
        function bar() {}
      EOS
    end

    it "detects one fired event" do
      @fires.length.should == 1
    end

    it "detects event name that's fired" do
      @fires[0].should == "click"
    end
  end

  describe "@fires with multiple events" do
    before do
      @fires = parse_fires(<<-EOS)
        /**
         * @fires click dblclick
         */
        function bar() {}
      EOS
    end

    it "detects two events" do
      @fires.length.should == 2
    end

    it "detects event names" do
      @fires[0].should == "click"
      @fires[1].should == "dblclick"
    end
  end

  describe "multiple @fires tags" do
    before do
      @fires = parse_fires(<<-EOS)
        /**
         * @fires click
         * @fires dblclick
         */
        function bar() {}
      EOS
    end

    it "detects two events" do
      @fires.length.should == 2
    end

    it "detects event names" do
      @fires[0].should == "click"
      @fires[1].should == "dblclick"
    end
  end

  describe "this.fireEvent() in code" do
    before do
      @fires = parse_fires(<<-EOS)
        /** */
        function bar() {
            this.fireEvent("click");
        }
      EOS
    end

    it "detects event from code" do
      @fires[0].should == "click"
    end
  end

end
