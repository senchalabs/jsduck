require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  shared_examples_for "cfg" do
    it "creates cfg" do
      @doc[:tagname].should == :cfg
    end
  end

  shared_examples_for "property" do
    it "creates property" do
      @doc[:tagname].should == :property
    end
  end

  shared_examples_for "cfg or property" do
    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Some documentation."
    end

    it "detects name" do
      @doc[:name].should == "foo"
    end
  end

  shared_examples_for "cfg or property default type" do
    it "default type is Object" do
      @doc[:type].should == "Object"
    end
  end

  shared_examples_for "cfg or property String type" do
    it "detects type" do
      @doc[:type].should == "String"
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
    it_should_behave_like "cfg"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "explicit @property" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @property {String} foo
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "implicit @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg
         * Some documentation.
         */
        foo: "asdf"
      EOS
    end
    it_should_behave_like "cfg"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "implicit @property" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some documentation.
         */
        foo: "asdf"
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "typeless @cfg" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg
         * Some documentation.
         */
        foo: func(),
      EOS
    end
    it_should_behave_like "cfg"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property default type"
  end

  describe "typeless @property" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @property
         * Some documentation.
         */
        foo: func(),
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property default type"
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

  shared_examples_for "auto type" do
    it "should imply correct type" do
      @doc[:type].should == @type
    end
  end

  describe "@property with number in code" do
    before do
      @doc = parse("/** @property */ foo: 123")[0]
      @type = "Number"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with regex in code" do
    before do
      @doc = parse("/** @property */ foo: /foo/i")[0]
      @type = "RegExp"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with true in code" do
    before do
      @doc = parse("/** @property */ foo: true")[0]
      @type = "Boolean"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with false in code" do
    before do
      @doc = parse("/** @property */ foo: false")[0]
      @type = "Boolean"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with function in code" do
    before do
      @doc = parse("/** @property */ function foo() {}")[0]
      @type = "Function"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with lambda in code" do
    before do
      @doc = parse("/** @property */ foo = function() {}")[0]
      @type = "Function"
    end
    it_should_behave_like "auto type"
  end

  describe "@property with @type" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @property foo
         * @type String
         * Some documentation.
         */
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "@type without @property" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @type String
         * Some documentation.
         */
        MY_CONSTANT: true,
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property String type"
    it "detects name" do
      @doc[:name].should == "MY_CONSTANT"
    end
  end

  describe "@property with 'this' in ident chain" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @property
         * Some documentation.
         */
        this.foo = "";
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
    it_should_behave_like "cfg or property String type"
  end

  describe "comma-first style" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some documentation.
         */
        ,foo: ""
      EOS
    end
    it_should_behave_like "property"
    it_should_behave_like "cfg or property"
  end

end
