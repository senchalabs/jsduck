require "mini_parser"

describe JsDuck::Aggregator do

  def parse(string)
    Helper::MiniParser.parse(string)
  end

  def parse_member(string)
    parse(string)["global"][:members][0]
  end

  shared_examples_for "example property" do
    it "creates property" do
      @doc[:tagname].should == :property
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

  describe "explicit @property" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @property {String} foo
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "example property"
  end

  describe "implicit @property" do
    before do
      @doc = parse_member(<<-EOS)
      ({/**
         * Some documentation.
         */
        foo: "asdf" })
      EOS
    end
    it_should_behave_like "example property"
  end

  describe "typeless @property" do
    before do
      @doc = parse_member(<<-EOS)
      ({/**
         * @property
         * Some documentation.
         */
        foo: func() })
      EOS
    end

    it "default type is Object" do
      @doc[:type].should == "Object"
    end
  end

  describe "@property with @type" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @property foo
         * @type String
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "example property"
  end

  describe "@type without @property" do
    before do
      @doc = parse_member(<<-EOS)
      ({/**
         * @type String
         * Some documentation.
         */
        MY_CONSTANT: true })
      EOS
    end

    it "detects property" do
      @doc[:tagname].should == :property
    end
    it "detects name" do
      @doc[:name].should == "MY_CONSTANT"
    end
  end

  describe "@property with 'this' in ident chain" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * @property
         * Some documentation.
         */
        this.foo = ""
      EOS
    end
    it_should_behave_like "example property"
  end

  describe "doc-comment before variable without assignment" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * Some documentation.
         */
        var foo;
      EOS
    end
    it "should detect the variable name" do
      @doc[:name].should == "foo"
    end
  end

  describe "doc-comment before multiple variables" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * Some documentation.
         */
        var foo, bar, baz;
      EOS
    end
    it "should detect the first variable name" do
      @doc[:name].should == "foo"
    end
  end

  describe "doc-comment before function call" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * Some documentation.
         */
        Ext.createAlias(MyClass, "foo", "bar");
      EOS
    end
    it "should fail detecting name of the property" do
      @doc[:name].should == ""
    end
  end

  describe "doc-comment before Object.defineProperty" do
    before do
      @doc = parse_member(<<-EOS)
        /**
         * Some documentation.
         */
        Object.defineProperty(this, 'foo', {
            value: "asdf",
            enumerable: true
        });
      EOS
    end
    it_should_behave_like "example property"
  end

  shared_examples_for "auto type" do
    it "should imply correct type" do
      @doc[:type].should == @type
    end
  end

  describe "@property with number in code" do
    before do
      @doc = parse_member("({ /** @property */ foo: 123 })")
      @type = "Number"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with regex in code" do
    before do
      @doc = parse_member("({ /** @property */ foo: /foo/i })")
      @type = "RegExp"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with true in code" do
    before do
      @doc = parse_member("({ /** @property */ foo: true })")
      @type = "Boolean"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with false in code" do
    before do
      @doc = parse_member("({ /** @property */ foo: false })")
      @type = "Boolean"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with function in code" do
    before do
      @doc = parse_member("/** @property */ function foo() {}")
      @type = "Function"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with lambda in code" do
    before do
      @doc = parse_member("/** @property */ foo = function() {}")
      @type = "Function"
    end
    it_should_behave_like "auto type"
  end

  shared_examples_for "auto detected property" do
    it "detects a property" do
      property[:tagname].should == :property
    end

    it "detects property name" do
      property[:name].should == 'foo'
    end

    it "flags property with :inheritdoc" do
      property[:inheritdoc].should == {}
    end

    it "flags property as :autodetected" do
      property[:autodetected][:tagname].should == :property
    end
  end

  describe "property without comment inside Ext.define" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        Ext.define("MyClass", {
            foo: 15
        });
      EOS
    end

    it_should_behave_like "auto detected property"
  end

  describe "property with line comment inside Ext.define" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        Ext.define("MyClass", {
            // My docs
            foo: "bar"
        });
      EOS
    end

    it_should_behave_like "auto detected property"

    it "detects property documentation" do
      property[:doc].should == 'My docs'
    end
  end

  describe "property without comment inside Ext.extend" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        MyClass = Ext.extend(Object, {
            foo: 15
        });
      EOS
    end

    it_should_behave_like "auto detected property"
  end

  describe "property with line comment inside Ext.extend" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        MyClass = Ext.extend(Object, {
            // My docs
            foo: "bar"
        });
      EOS
    end

    it_should_behave_like "auto detected property"

    it "detects property documentation" do
      property[:doc].should == 'My docs'
    end
  end

  describe "property without comment inside object literal" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        MyClass = {
            foo: 15
        };
      EOS
    end

    it_should_behave_like "auto detected property"
  end

  describe "property with line comment inside object literal" do
    let(:property) do
      parse(<<-EOS)["MyClass"][:members][0]
        /** Some documentation. */
        MyClass = {
            // My docs
            foo: "bar"
        };
      EOS
    end

    it_should_behave_like "auto detected property"

    it "detects property documentation" do
      property[:doc].should == 'My docs'
    end
  end

end
