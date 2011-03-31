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
      @doc[:tagname].should == :css_var
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

  describe "CSS doc-comment followed by @mixin" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * Creates an awesome button.
         *
         * @param {string} $ui-label The name of the UI being created.
         * @param {color} $color Base color for the UI.
         */
        @mixin my-button {
        }
      EOCSS
    end

    it "detects mixin" do
      @doc[:tagname].should == :css_mixin
    end
    it "detects mixin name" do
      @doc[:name].should == "my-button"
    end
    it "detects mixin description" do
      @doc[:doc].should == "Creates an awesome button."
    end
    it "detects mixin parameters" do
      @doc[:params].length.should == 2
    end
    it "detects mixin param name" do
      @doc[:params][0][:name].should == "$ui-label"
    end
    it "detects mixin param type" do
      @doc[:params][0][:type].should == "string"
    end
    it "detects mixin param description" do
      @doc[:params][0][:doc].should == "The name of the UI being created."
    end
  end

end

