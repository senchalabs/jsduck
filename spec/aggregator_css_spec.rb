require "mini_parser"

describe JsDuck::Aggregator do

  def parse(string)
    Helper::MiniParser.parse(string, {:filename => ".css"})
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  describe "CSS with @var in doc-comment" do
    before do
      @doc = parse_member(<<-EOCSS)
        /**
         * @var {number} $button-height Default height for buttons.
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
      @doc[:type].should == "number"
    end
    it "detects variable description" do
      @doc[:doc].should == "Default height for buttons."
    end
  end

  describe "CSS @var with @member" do
    before do
      @doc = parse(<<-EOCSS)["Ext.Button"][:members][0]
        /**
         * @var {number} $button-height Default height for buttons.
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
      @doc = parse_member(<<-EOCSS)
        /**
         * @var {number} [$button-height=25px]
         */
      EOCSS
    end

    it "detects default value" do
      @doc[:default].should == "25px"
    end
  end

  describe "CSS doc-comment followed with $var-name:" do
    before do
      @doc = parse_member(<<-EOCSS)
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
      @doc[:type].should == "number"
    end
    it "detects variable default value" do
      @doc[:default].should == "25px"
    end
  end

  describe "CSS doc-comment followed by @mixin" do
    before do
      @doc = parse_member(<<-EOCSS)
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
