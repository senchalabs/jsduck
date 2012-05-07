require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  shared_examples_for "config" do
    let(:cfg) do
      parse(<<-EOS)[0][:members][:cfg]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            #{propertyName}: {
                foo: 42,
                /** Docs for bar */
                bar: "hello"
            }
        });
      EOS
    end

    # Generic tests

    it "finds configs" do
      cfg.should be_kind_of(Array)
    end

    it "finds two configs" do
      cfg.length.should == 2
    end

    # auto-detected config

    it "sets :inheritdoc flag on config" do
      cfg[0][:inheritdoc].should == {}
    end

    it "sets :accessor flag on config" do
      cfg[0][:accessor].should == true
    end

    it "sets :autodetected flag on config" do
      cfg[0][:autodetected].should == true
    end

    # config with plain doc-comment

    it "detects the config with docs" do
      cfg[1][:doc].should == "Docs for bar"
    end

    it "detects owner of the config" do
      cfg[1][:owner].should == "MyClass"
    end

    it "detects the config as public" do
      cfg[1][:private].should_not == true
    end

    it "detects the config accessor" do
      cfg[1][:accessor].should == true
    end
  end

  describe "detecting Ext.define() with config:" do
    let(:propertyName) { "config" }

    it_should_behave_like "config"
  end

  describe "detecting Ext.define() with cachedConfig:" do
    let(:propertyName) { "cachedConfig" }

    it_should_behave_like "config"
  end

  describe "detecting Ext.define() with both config and cachedConfig" do
    let(:cfg) do
      parse(<<-EOS)[0][:members][:cfg]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            cachedConfig: {
                foo: 42,
                bar: "hello"
            },
            config: {
                baz: /fafa/
            }
        });
      EOS
    end

    it "merges all configs together" do
      cfg.length.should == 3
    end
  end

end
