require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  describe "member with @protected" do
    before do
      @doc = parse("/** @protected */")[0]
    end

    it "gets protected attribute" do
      @doc[:meta][:protected].should == true
    end
  end

  describe "member with @abstract" do
    before do
      @doc = parse("/** @abstract */")[0]
    end

    it "gets abstract attribute" do
      @doc[:meta][:abstract].should == true
    end
  end

  describe "member with @static" do
    before do
      @doc = parse("/** @static */")[0]
    end

    it "gets static attribute" do
      @doc[:meta][:static].should == true
    end
  end

  describe "Property with @readonly" do
    before do
      @doc = parse("/** @readonly */")[0]
    end

    it "gets readonly attribute" do
      @doc[:meta][:readonly].should == true
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
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some function
         * @template
         */
      EOS
    end
    it "gets template attribute" do
      @doc[:meta][:template].should == true
    end
  end

  describe "a normal config option" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg foo Something
         */
      EOS
    end
    it "is not required by default" do
      @doc[:meta][:required].should_not == true
    end
  end

  describe "a config option labeled as required" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg foo (required) Something
         */
      EOS
    end
    it "has required flag set to true" do
      @doc[:meta][:required].should == true
    end
  end

  describe "a class with @cfg (required)" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @cfg foo (required)
         */
      EOS
    end
    it "doesn't become a required class" do
      @doc[:meta][:required].should_not == true
    end
    it "contains required config" do
      @doc[:members][0][:meta][:required].should == true
    end
  end

  describe "member with @deprecated" do
    before do
      @deprecated = parse(<<-EOS)[0][:meta][:deprecated]
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
      @deprecated = parse(<<-EOS)[0][:meta][:deprecated]
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
      @doc = parse(<<-EOS)[0]
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
