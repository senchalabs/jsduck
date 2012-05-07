require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  def parse_config_code(propertyName)
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

  shared_examples_for "config" do
    # Generic tests

    it "finds configs" do
      cfg.should be_kind_of(Array)
    end

    it "finds two configs" do
      cfg.length.should == 2
    end

    describe "auto-detected config" do
      it "with :inheritdoc flag" do
        cfg[0][:inheritdoc].should == {}
      end

      it "with :accessor flag" do
        cfg[0][:accessor].should == true
      end

      it "with :autodetected flag" do
        cfg[0][:autodetected].should == true
      end
    end

    describe "documented config" do
      it "with docs" do
        cfg[1][:doc].should == "Docs for bar"
      end

      it "with owner" do
        cfg[1][:owner].should == "MyClass"
      end

      it "as public" do
        cfg[1][:private].should_not == true
      end

      it "with :accessor flag" do
        cfg[1][:accessor].should == true
      end
    end
  end

  describe "detecting Ext.define() with config:" do
    let(:cfg) { parse_config_code("config") }

    it_should_behave_like "config"
  end

  describe "detecting Ext.define() with cachedConfig:" do
    let(:cfg) { parse_config_code("cachedConfig") }

    it_should_behave_like "config"
  end

  describe "detecting Ext.define() with eventedConfig:" do
    let(:cfg) { parse_config_code("eventedConfig") }

    it_should_behave_like "config"

    it "auto-detected config with :evented flag" do
      cfg[0][:evented].should == true
    end

    it "documented config with :evented flag" do
      cfg[1][:evented].should == true
    end
  end

  describe "detecting Ext.define() with all kind of configs" do
    let(:cfg) do
      parse(<<-EOS)[0][:members][:cfg]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            config: {
                blah: 7
            },
            cachedConfig: {
                foo: 42,
                bar: "hello"
            },
            eventedConfig: {
                baz: /fafa/
            }
        });
      EOS
    end

    it "merges all configs together" do
      cfg.length.should == 4
    end
  end

end
