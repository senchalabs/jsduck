require "jsduck/aggregator"
require "jsduck/css_parser"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::CssParser.new(string).parse)
    agr.result
  end

  it "yields no results when parsing CSS without doc-comments" do
    @docs = parse("div > p a:link {text-align: top;}")
    @docs.length.should == 0
  end

  describe "CSS with @var in doc-comment" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * @var {measurement} $button-height Default height for buttons.
         */
      EOCSS
    end

    it "detects variable" do
      @doc[:tagname].should == :var
    end
    it "detects variable name" do
      @doc[:name].should == "$button-height"
    end
    it "detects variable type" do
      @doc[:type].should == "measurement"
    end
    it "detects variable description" do
      @doc[:doc].should == "Default height for buttons."
    end
  end

end

