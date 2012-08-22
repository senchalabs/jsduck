require "jsduck/aggregator"
require "jsduck/source_file"
require "jsduck/class"
require "jsduck/relations"
require "jsduck/return_values"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    relations = JsDuck::Relations.new(agr.result.map {|doc| JsDuck::Class.new(doc) })
    JsDuck::ReturnValues.auto_detect(relations)
    relations
  end

  describe "both @return this and @chainable in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {MyClass} this The instance itself.
             * @chainable
             */
            bar: function() {}
        });
      EOS
    end

    it "detects method as chainable" do
      cls[:members][0][:meta][:chainable].should == true
    end

    it "keeps the original @return docs" do
      cls[:members][0][:return][:doc].should == "this The instance itself."
    end
  end

  describe "simple @chainable in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @chainable
             */
            bar: function() {}
        });
      EOS
    end

    it "detects method as chainable" do
      cls[:members][0][:meta][:chainable].should == true
    end

    it "adds @return {MyClass} this" do
      cls[:members][0][:return][:type].should == "MyClass"
      cls[:members][0][:return][:doc].should == "this"
    end
  end

  describe "an @return {MyClass} this in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {MyClass} this
             */
            bar: function() {}
        });
      EOS
    end

    it "detects @return {MyClass} this" do
      cls[:members][0][:return][:type].should == "MyClass"
      cls[:members][0][:return][:doc].should == "this"
    end

    it "adds @chainable tag" do
      cls[:members][0][:meta][:chainable].should == true
    end
  end

  describe "an @return {MyClass} this and other docs in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {MyClass} this and some more...
             */
            bar: function() {}
        });
      EOS
    end

    it "detects @return {MyClass} this" do
      cls[:members][0][:return][:type].should == "MyClass"
      cls[:members][0][:return][:doc].should == "this and some more..."
    end

    it "adds @chainable tag" do
      cls[:members][0][:meta][:chainable].should == true
    end
  end

  describe "an @return {MyClass} thisBlah in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {MyClass} thisBlah
             */
            bar: function() {}
        });
      EOS
    end

    it "doesn't add @chainable tag" do
      cls[:members][0][:meta][:chainable].should_not == true
    end
  end

  describe "an @return {OtherClass} this in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {OtherClass} this
             */
            bar: function() {}
        });
      EOS
    end

    it "doesn't add @chainable tag" do
      cls[:members][0][:meta][:chainable].should_not == true
    end
  end

  describe "an @return {MyClass} no-this in method doc" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return {MyClass}
             */
            bar: function() {}
        });
      EOS
    end

    it "doesn't add @chainable tag" do
      cls[:members][0][:meta][:chainable].should_not == true
    end
  end

  describe "function with 'return this;' in code" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** */
            bar: function() { return this; }
        });
      EOS
    end

    it "adds @chainable tag" do
      cls[:members][0][:meta][:chainable].should == true
    end

    it "adds @return {MyClass} this" do
      cls[:members][0][:return][:type].should == "MyClass"
      cls[:members][0][:return][:doc].should == "this"
    end
  end

end
