require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "single alias" do
    it "detects alias" do
      @doc[:aliases].should == {"widget" => ["foo"]}
    end
  end

  shared_examples_for "multiple aliases" do
    it "collects all aliases together" do
      @doc[:aliases].should == {"widget" => ["foo", "bar"]}
    end
  end

  describe "class with @alias" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alias widget.foo
         */
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "class with multiple @alias tags" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alias widget.foo
         * @alias widget.bar
         */
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

  describe "class with @alias tag without name" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alias
         */
      EOS
    end
    it "ignores the alias" do
      @doc[:aliases].should == {}
    end
  end

  describe "class with @alias tag without namespace" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alias foo
         */
      EOS
    end
    it "ignores the alias" do
      @doc[:aliases].should == {}
    end
  end

  describe "class with @xtype" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @xtype foo
         */
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "class with @xtype tag without name" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @xtype
         */
      EOS
    end
    it "ignores the alias" do
      @doc[:aliases].should == {}
    end
  end

  describe "class with @ftype" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @ftype foo
         */
      EOS
    end
    it "detects a feature alias" do
      @doc[:aliases].should == {"feature" => ["foo"]}
    end
  end

  describe "class with @ptype" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @ptype foo
         */
      EOS
    end
    it "detects a plugin alias" do
      @doc[:aliases].should == {"plugin" => ["foo"]}
    end
  end

  describe "@xtype after @constructor" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * Comment here.
         * @constructor
         * This constructs the class
         * @xtype foo
         */
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "class with multiple @xtypes" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @xtype foo
         * @xtype bar
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

  describe "Alias with more than one dot (.) in it" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alias widget.foo.bar
         */
      EOS
    end
    it "will use the first part as namespace" do
      @doc[:aliases].should == {"widget" => ["foo.bar"]}
    end
  end

  describe "Ext.define() with simple alias" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          alias: 'widget.foo'
        });
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "Ext.define() with @alias overriding alias" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @alias widget.foo
         */
        Ext.define('MyClass', {
          alias: 'widget.xxx'
        });
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "Ext.define() with @xtype overriding alias" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @xtype foo
         */
        Ext.define('MyClass', {
          alias: 'widget.xxx'
        });
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "Ext.define() with array of aliases" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          alias: ['widget.foo', 'widget.bar']
        });
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

  describe "Ext.define() with different kinds of aliases" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          alias: ['store.json', 'store.ajax', 'component.myclass']
        });
      EOS
    end
    it "collects all aliases together" do
      @doc[:aliases].should == {"store" => ["json", "ajax"], "component" => ["myclass"]}
    end
  end

  describe "Ext.define() with dash inside alias name" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          alias: 'widget.foo-bar'
        });
      EOS
    end
    it "treats dash as a normal character" do
      @doc[:aliases].should == {"widget" => ["foo-bar"]}
    end
  end

  describe "Ext.define() with xtype property" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          xtype: 'foo'
        });
      EOS
    end
    it_should_behave_like "single alias"
  end

  describe "Ext.define() with array xtype property" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          xtype: ['foo', 'bar']
        });
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

  describe "Ext.define() with both xtype and alias" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          alias: 'widget.foo',
          xtype: 'bar'
        });
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

  describe "one class many times" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class Foo
         */
        /**
         * @class Foo
         * @xtype foo
         */
        /**
         * @class Foo
         * @xtype bar
         */
      EOS
    end
    it_should_behave_like "multiple aliases"
  end

end
