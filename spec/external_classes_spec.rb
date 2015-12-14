require "jsduck/external_classes"

describe JsDuck::ExternalClasses do

  before do
    @external = JsDuck::ExternalClasses.new(["Foo", "Ns.bar.Baz", "Bla.*"])
  end

  it "matches simple classname" do
    @external.is?("Foo").should == true
  end

  it "matches namespaced classname" do
    @external.is?("Ns.bar.Baz").should == true
  end

  it "doesn't match completely different classname" do
    @external.is?("Zap").should_not == true
  end

  it "doesn't match classname beginning like an external classname" do
    @external.is?("Foo.Bar").should_not == true
  end

  it "matches external classname defined with a wildcard" do
    @external.is?("Bla.Bla").should == true
  end

  it "escapes '.' correctly in external pattern and doesn't match a classname missing the dot" do
    @external.is?("Bla_Bla").should == false
  end

  it "doesn't match HTMLElement by default" do
    @external.is?("HTMLElement").should == false
  end

  describe "with '@browser' in list of patterns" do
    before do
      @external.add("@browser")
    end

    it "doesn't match the special '@browser' pattern itself" do
      @external.is?("@browser").should == false
    end

    # These classes were originally in the set of default externals.
    %w(
      HTMLElement
      HTMLDivElement
      XMLHttpRequest
      Window
      NodeList
      CSSStyleSheet
      CSSStyleRule
      Event
    ).each do |name|
      it "matches #{name}" do
        @external.is?(name).should == true
      end
    end

  end

end
