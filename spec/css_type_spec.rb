require 'jsduck/css/parser'

# We test the Css::Type through Css::Parser to avoid the whole
# setup of Sass::Engine.
describe JsDuck::Css::Type do

  def detect(expr)
    ast = JsDuck::Css::Parser.new("/** */ $foo: #{expr};").parse
    ast[0][:code][:type]
  end

  describe "detects" do
    it "plain number --> number" do
      detect("3.14").should == "number"
    end
    it "percentage --> number" do
      detect("10%").should == "number"
    end
    it "measurement --> number" do
      detect("15px").should == "number"
    end

    it "unquoted string --> string" do
      detect("bold").should == "string"
    end
    it "quoted string --> string" do
      detect('"blah blah"').should == "string"
    end

    it "color name --> color" do
      detect("orange").should == "color"
    end
    it "color code --> color" do
      detect("#ff00cc").should == "color"
    end
    it "rgba() --> color" do
      detect("rgba(255, 0, 0, 0.5)").should == "color"
    end
    it "hsl() --> color" do
      detect("hsl(0, 100%, 50%)").should == "color"
    end
    it "fade-in() --> color" do
      detect("fade-in(#cc00cc, 0.2)").should == "color"
    end

    it "true --> boolean" do
      detect("true").should == "boolean"
    end
    it "false --> boolean" do
      detect("false").should == "boolean"
    end

    it "comma-separated list --> list" do
      detect("'Arial', Verdana, sans-serif").should == "list"
    end
    it "space-separated list --> list" do
      detect("2px 4px 2px 4px").should == "list"
    end

    it "null --> nil" do
      detect("null").should == nil
    end
  end

end
