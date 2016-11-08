require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "member with @protected" do
    before do
      @doc = parse_member("/** @protected */")
    end

    it "gets protected attribute" do
      @doc[:protected].should == true
    end
  end

  describe "member with @abstract" do
    before do
      @doc = parse_member("/** @abstract */")
    end

    it "gets abstract attribute" do
      @doc[:abstract].should == true
    end
  end

  describe "member with @static" do
    before do
      @doc = parse_member("/** @static */")
    end

    it "gets static attribute" do
      @doc[:static].should == true
    end
  end
  
  describe "Property with @writeonly" do
    before do
      @doc = parse("/** @writeonly */")[0]
    end

    it "gets writeonly attribute" do
      @doc[:meta][:writeonly].should == true
    end
  end

  describe "method with @template" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @method foo
         * Some function
         * @template
         */
      EOS
    end
    it "gets template attribute" do
      @doc[:template].should == true
    end
  end

  describe "event with @preventable" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @event foo
         * @preventable bla blah
         * Some event
         */
      EOS
    end
    it "gets preventable attribute" do
      @doc[:preventable].should == true
    end
    it "ignores text right after @preventable" do
      @doc[:doc].should == "Some event"
    end
  end

  describe "member with @deprecated" do
    before do
      @deprecated = parse_member(<<-EOS)[:deprecated]
        /**
         * @deprecated 4.0 Use escapeRegex instead.
         */
      EOS
    end

    it "gets deprecated attribute" do
      @deprecated.should_not == nil
    end

    it "detects deprecation description" do
      @deprecated[:text].should == "Use escapeRegex instead."
    end

    it "detects version of deprecation" do
      @deprecated[:version].should == "4.0"
    end
  end

  describe "member with @deprecated without version number" do
    before do
      @deprecated = parse_member(<<-EOS)[:deprecated]
        /**
         * @deprecated Use escapeRegex instead.
         */
      EOS
    end

    it "doesn't detect version number" do
      @deprecated[:version].should == nil
    end

    it "still detects description" do
      @deprecated[:text].should == "Use escapeRegex instead."
    end
  end

  describe "class with @markdown" do
    before do
      @doc = parse(<<-EOS)["MyClass"]
        /**
         * @class MyClass
         * @markdown
         * Comment here.
         */
      EOS
    end

    it "does not show @markdown tag in docs" do
      @doc[:doc].should == "Comment here."
    end
  end

end
