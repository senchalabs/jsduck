require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string, ".css"))
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
         * @var {length} $button-height Default height for buttons.
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
      @doc[:type].should == "length"
    end
    it "detects variable description" do
      @doc[:doc].should == "Default height for buttons."
    end
  end

  describe "CSS @var with @member" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * @var {length} $button-height Default height for buttons.
         * @member Ext.Button
         */
      EOCSS
    end

    it "detects owner" do
      @doc[:owner].should == "Ext.Button"
    end
  end

  describe "CSS @var with explicit default value" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * @var {length} [$button-height=25px]
         */
      EOCSS
    end

    it "detects default value" do
      @doc[:default].should == "25px"
    end
  end

  describe "CSS doc-comment followed with $var-name:" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * Default height for buttons.
         */
        $button-height: 25px;
      EOCSS
    end

    it "detects variable" do
      @doc[:tagname].should == :css_var
    end
    it "detects variable name" do
      @doc[:name].should == "$button-height"
    end
    it "detects variable type" do
      @doc[:type].should == "length"
    end
    it "detects variable default value" do
      @doc[:default].should == "25px"
    end
  end

  describe "$var-name: value followed by !default" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /** */
        $foo: 25px !default;
      EOCSS
    end

    it "detects variable" do
      @doc[:tagname].should == :css_var
    end
    it "detects variable type" do
      @doc[:type].should == "length"
    end
    it "detects variable default value" do
      @doc[:default].should == "25px"
    end
  end

  describe "$var-name: followed by multiple values" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /** */
        $foo: 25px 0 1em 0;
      EOCSS
    end

    it "detects variable type by first value" do
      @doc[:type].should == "length"
    end
    it "detects variable default value" do
      @doc[:default].should == "25px 0 1em 0"
    end
  end

  describe "$var-name: followed by comma-separated values" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /** */
        $foo: "Arial", "Verdana", sans-serif;
      EOCSS
    end

    it "detects variable type by first value" do
      @doc[:type].should == "string"
    end
    it "detects variable default value" do
      @doc[:default].should == '"Arial" , "Verdana" , sans-serif'
    end
  end

  describe "$var-name: followed by unknown function" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /** */
        $foo: myfunc(1, 2);
      EOCSS
    end

    it "doesn't detect variable type" do
      @doc[:type].should == "Object"
    end
    it "detects variable default value" do
      @doc[:default].should == 'myfunc ( 1 , 2 )'
    end
  end

  def detect_type(value)
    return parse(<<-EOCSS)[0][:type]
      /** */
      $foo: #{value};
    EOCSS
  end

  describe "auto-detection of CSS variable types" do
    it "detects integer" do
      detect_type("15").should == "number"
    end
    it "detects float" do
      detect_type("15.6").should == "number"
    end
    it "detects float begging with dot" do
      detect_type(".6").should == "number"
    end
    it "detects length" do
      detect_type("15em").should == "length"
    end
    it "detects percentage" do
      detect_type("99.9%").should == "percentage"
    end
    it "detects boolean true" do
      detect_type("true").should == "boolean"
    end
    it "detects boolean false" do
      detect_type("false").should == "boolean"
    end
    it "detects string" do
      detect_type('"Hello"').should == "string"
    end
    it "detects #000 color" do
      detect_type("#F0a").should == "color"
    end
    it "detects #000000 color" do
      detect_type("#FF00aa").should == "color"
    end
    it "detects rgb(...) color" do
      detect_type("rgb(255, 0, 0)").should == "color"
    end
    it "detects rgba(...) color" do
      detect_type("rgba(100%, 0%, 0%, 0.5)").should == "color"
    end
    it "detects hsl(...) color" do
      detect_type("hsl(255, 0, 0)").should == "color"
    end
    it "detects hsla(...) color" do
      detect_type("hsla(100%, 0%, 0%, 0.5)").should == "color"
    end

    # basic CSS color keywords
    "black silver gray white maroon red purple fuchsia green lime olive yellow navy blue teal aqua".split(/ /).each do |c|
      it "detects #{c} color keyword" do
        detect_type(c).should == "color"
      end
    end
    it "detects wide-supported orange color keyword" do
      detect_type("orange").should == "color"
    end
    it "detects transparent color keyword" do
      detect_type("transparent").should == "color"
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

  describe "CSS doc-comment followed by CSS selector" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * Some comment.
         */
        .highlight {
            font-weight: bold;
        }
      EOCSS
    end

    it "gets detected as property" do
      @doc[:tagname].should == :property
    end
  end

  describe "CSS doc-comment followed by nothing" do
    before do
      @doc = parse(<<-EOCSS)[0]
        /**
         * Some comment.
         */
      EOCSS
    end

    it "gets detected as property" do
      @doc[:tagname].should == :property
    end
  end

end

