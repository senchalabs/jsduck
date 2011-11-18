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

  # @static
  # @deprecated
  # (required)

end
