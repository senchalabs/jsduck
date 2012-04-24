require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "detecting Ext.define() with configs in code" do
    let(:cfg) do
      parse(<<-EOS)[0][:members][:cfg]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            config: {
                foo: 42,
                bar: "hello"
            }
        });
      EOS
    end

    it "finds configs" do
      cfg.should be_kind_of(Array)
    end

    it "finds two configs" do
      cfg.length.should == 2
    end

    it "sets :inheritdoc flag on config" do
      cfg[0][:inheritdoc].should == {:no_warnings => true}
    end

    it "sets :private flag on config" do
      cfg[0][:private].should == true
    end

    it "sets meta :private flag on config" do
      cfg[0][:meta][:private].should == true
    end
  end

  describe "detecting Ext.define() with commented config" do
    let(:docs) do
      parse(<<-EOS)
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            config: {
                /** Docs for bar */
                bar: "hello"
            }
        });
      EOS
    end

    it "finds one docset" do
      docs.length.should == 1
    end

    it "detects it as class" do
      docs[0][:tagname] == :class
    end

    it "detects one config within class" do
      docs[0][:members][:cfg].length.should == 1
    end

    it "detects the config with docs" do
      docs[0][:members][:cfg][0][:doc].should == "Docs for bar"
    end

    it "detects owner of the config" do
      docs[0][:members][:cfg][0][:owner].should == "MyClass"
    end

    it "detects the config as public" do
      docs[0][:members][:cfg][0][:private].should_not == true
    end
  end

end
