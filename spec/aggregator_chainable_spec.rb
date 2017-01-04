require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/class"
require "jsduck/relations"
require "jsduck/return_values"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
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

  describe "method without any code" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** @method bar */
        });
      EOS
    end

    it "doesn't add @chainable tag" do
      cls[:members][0][:meta][:chainable].should_not == true
    end
  end

  describe "method consisting of Ext.emptyFn in code" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** */
            bar: Ext.emptyFn
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

  describe "constructor with no @return" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** */
            constructor: function() {}
        });
      EOS
    end

    it "sets return type to owner class" do
      cls[:members][0][:return][:type].should == "MyClass"
    end
  end

  describe "constructor with simple @return" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @return new instance
             */
            constructor: function() {}
        });
      EOS
    end

    it "sets return type to owner class" do
      cls[:members][0][:return][:type].should == "MyClass"
    end
  end

  describe "constructor with @constructor tag" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /**
             * @constructor
             */
            constructor: function() {}
        });
      EOS
    end

    it "sets return type to owner class" do
      cls[:members][0][:return][:type].should == "MyClass"
    end
  end

  describe "constructor containing 'return this;'" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** */
            constructor: function() {return this;}
        });
      EOS
    end

    it "doesn't get @chainable tag" do
      cls[:members][0][:meta][:chainable].should_not == true
    end
  end

  describe "constructor with some other explicit return type" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /** */
        Ext.define("MyClass", {
            /** @return {OtherClass} new instance */
            constructor: function() {}
        });
      EOS
    end

    it "keeps the explicit return type" do
      cls[:members][0][:return][:type].should == "OtherClass"
    end
  end
end
