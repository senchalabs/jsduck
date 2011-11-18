require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "member with @protected" do
    before do
      @doc = parse("/** @protected */")[0]
    end

    it "gets protected attribute" do
      @doc[:attributes][:protected].should == true
    end
  end

  describe "member with @abstract" do
    before do
      @doc = parse("/** @abstract */")[0]
    end

    it "gets abstract attribute" do
      @doc[:attributes][:abstract].should == true
    end
  end

  describe "member with @static" do
    before do
      @doc = parse("/** @static */")[0]
    end

    it "gets static attribute" do
      @doc[:attributes][:static].should == true
    end
  end

  describe "Property with @readonly" do
    before do
      @doc = parse("/** @readonly */")[0]
    end

    it "gets readonly attribute" do
      @doc[:attributes][:readonly].should == true
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
      @doc[:attributes][:template].should == true
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
      @doc[:attributes][:required].should_not == true
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
      @doc[:attributes][:required].should == true
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
      @doc[:attributes][:required].should_not == true
    end
    it "contains required config" do
      @doc[:members][:cfg][0][:attributes][:required].should == true
    end
  end

  # @deprecated

end
