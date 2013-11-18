require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string, {:components => true})
  end

  describe "class without @component" do
    let(:cls) do
      parse(<<-EOS)["Foo"]
        /** */
        Ext.define("Foo", {
        });
      EOS
    end

    it "does not get the :component flag" do
      cls[:component].should_not == true
    end
  end

  describe "class with @component" do
    let(:cls) do
      parse(<<-EOS)["Foo"]
        /**
         * Some class
         * @component
         */
        Ext.define("Foo", {
        });
      EOS
    end

    it "gets the :component flag" do
      cls[:component].should == true
    end
  end

  describe "class inheriting from Ext.Component" do
    let(:cls) do
      parse(<<-EOS)["Foo"]
        /** */
        Ext.define("Foo", {
            extend: "Ext.Component"
        });
      EOS
    end

    it "gets the :component flag" do
      cls[:component].should == true
    end
  end

  describe "the Ext.Component class itself" do
    let(:cls) do
      parse(<<-EOS)["Ext.Component"]
        /** */
        Ext.define("Ext.Component", {
        });
      EOS
    end

    it "also gets the :component flag" do
      cls[:component].should == true
    end
  end

end
