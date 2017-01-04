require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "example cfg" do
    it "creates cfg" do
      @doc[:tagname].should == :cfg
    end

    it "detects name" do
      @doc[:name].should == "foo"
    end

    it "detects type" do
      @doc[:type].should == "String"
    end

    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Some documentation."
    end
  end

  describe "explicit @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {String} foo
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "example cfg"
  end

  describe "implicit @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg
         * Some documentation.
         */
        foo: "asdf" })
      EOS
    end
    it_should_behave_like "example cfg"
  end

  describe "typeless @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg
         * Some documentation.
         */
        foo: func() })
      EOS
    end

    it "default type is Object" do
      @doc[:type].should == "Object"
    end
  end

  describe "null @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg
         * Some documentation.
         */
        foo: null })
      EOS
    end

    it "default type is Object" do
      @doc[:type].should == "Object"
    end
  end

  describe "@cfg with dash in name" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {String} foo-bar
         * Some documentation.
         */
      EOS
    end

    it "detects the name" do
      @doc[:name].should == "foo-bar"
    end
  end

  describe "@cfg with uppercase name" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg {String} Foo
         */
        Foo: 12 })
      EOS
    end

    it "is detected as config" do
      @doc[:tagname].should == :cfg
    end
  end

  describe "@cfg with uppercase name after description" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * Docs here
         * @cfg {String} Foo
         */
        Foo: 12 })
      EOS
    end

    it "is detected as config" do
      @doc[:tagname].should == :cfg
    end
  end

  def parse_config_code(propertyName)
    parse(<<-EOS)[0][:members]
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
      cfg.all? {|m| m[:tagname] == :cfg }.should == true
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

      it "with :linenr field" do
        cfg[0][:linenr].should == 6
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
      parse(<<-EOS)[0][:members]
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

  describe "Ext.define() with line-comment before config:" do
    let(:cfg) do
      parse(<<-EOS)[0][:members]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            config: {
                // My config
                blah: 7
            }
        });
      EOS
    end

    it "detects one config" do
      cfg.length.should == 1
    end

    it "detects documentation" do
      cfg[0][:doc].should == "My config"
    end

    it "detects the config with :inheritdoc flag" do
      cfg[0][:inheritdoc].should == {}
    end

    it "detects the config with :autodetected flag" do
      cfg[0][:autodetected].should == true
    end
  end

end
