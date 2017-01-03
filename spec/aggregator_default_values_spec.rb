require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "optional parameter" do
    it "makes parameter optional" do
      @param[:optional].should == true
    end

    it "keeps parameter name" do
      @param[:name].should == "foo"
    end

    it "leaves optionality syntax out of description" do
      @param[:doc].should == "Something"
    end
  end

  describe "parameter name followed with (optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo (optional) Something
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter name followed with mixed-case (Optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo (Optional) Something
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter name followed with 'optional'" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo optional Something
         */
        function foo() {}
      EOS
    end
    it "doesn't make parameter optional" do
      @param[:optional].should == false
    end
  end

  describe "parameter description containing (optional)" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} foo Something (optional)
         */
        function foo() {}
      EOS
    end
    it "doesn't make parameter optional" do
      @param[:optional].should == false
    end
  end

  describe "parameter name in [brackets]" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo] Something
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "optional parameter"
  end

  describe "parameter with optional param type annotation {Foo=}" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number=} foo Something
         */
        function foo() {}
      EOS
    end

    it_should_behave_like "optional parameter"

    it "doesn't include the optionality notation to type definition" do
      @param[:type].should == "Number"
    end
  end

  describe "cfg without optionality type annotation {Foo=}" do
    before do
      @cfg = parse(<<-EOS)[0]
        /**
         * @cfg {Number} foo Something
         */
      EOS
    end

    it "doesn't default to required" do
      @cfg[:meta][:required].should_not == true
    end
  end

  describe "parameter with explicit default value" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo=42] Something
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "optional parameter"
    it "has default value" do
      @param[:default].should == "42"
    end
  end

  describe "parameter with explicit string default value" do
    before do
      @param = parse(<<-EOS)[0][:params][0]
        /**
         * @param {Number} [foo="Hello, my [dear]!"] Something
         */
        function foo() {}
      EOS
    end
    it_should_behave_like "optional parameter"
    it "has default value" do
      @param[:default].should == '"Hello, my [dear]!"'
    end
  end

  describe "property with default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @property {Number} [foo=3] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == "3"
    end
  end

  describe "cfg with explicit regex default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=/[0-9]+/] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == "/[0-9]+/"
    end
  end

  describe "cfg with explicit boolean true default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=true] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == "true"
    end
  end

  describe "cfg with explicit boolean false default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=false] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == "false"
    end
  end

  describe "cfg with explicit array default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=["foo", 5, /[a-z]/]] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == '["foo", 5, /[a-z]/]'
    end
  end

  describe "cfg with explicit object default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo={"foo": 5, bar: [1, 2, 3]}] Something
         */
      EOS
    end
    it "has default value" do
      @doc[:default].should == '{"foo": 5, bar: [1, 2, 3]}'
    end
  end

  describe "cfg with this as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=this] Something
         */
      EOS
    end
    it "has this as default value" do
      @doc[:default].should == 'this'
    end
  end

  describe "cfg with rubbish as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=!haa] Something
         */
      EOS
    end
    it "has the rubbish as default value" do
      @doc[:default].should == '!haa'
    end
  end

  describe "cfg with rubbish after default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=7 and me too] Something
         */
      EOS
    end
    it "has everything up to ] as default value" do
      @doc[:default].should == '7 and me too'
    end
  end

  describe "cfg with array literal of idents as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=[ho, ho]] Something
         */
      EOS
    end
    it "has the full literal as default value" do
      @doc[:default].should == '[ho, ho]'
    end
  end

  describe "cfg with unfinished array literal as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=[...] Something
         */
      EOS
    end
    it "has default value up to first ]" do
      @doc[:default].should == '[...'
    end
  end

  describe "cfg with bogus object literal as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo={ho:5, ho}] Something
         */
      EOS
    end
    it "has the bogus object literla as default value" do
      @doc[:default].should == '{ho:5, ho}'
    end
  end

  describe "cfg with unfinished object literal as default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo={ho:5] Something
         */
      EOS
    end
    it "has the unfinish object literal as default value" do
      @doc[:default].should == '{ho:5'
    end
  end

  describe "cfg with string ']' inside default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo="]"] Something
         */
      EOS
    end
    it "includes the ] inside default value" do
      @doc[:default].should == '"]"'
    end
  end

  describe "cfg with escaped quote inside default value" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} [foo=" \\"] "] Something
         */
      EOS
    end
    it "includes the \" inside default value" do
      @doc[:default].should == '" \\"] "'
      @doc[:doc].should == 'Something'
    end
  end

  describe "cfg with implicit default value" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: 18 })
      EOS
    end
    it "detects the default value" do
      @doc[:default].should == '18'
    end
  end

  describe "cfg with implicit default string value" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: "Hello" })
      EOS
    end
    it "detects the default value" do
      @doc[:default].should == '"Hello"'
    end
  end

  describe "cfg with implicit default regex value" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: /[a-z]/ })
      EOS
    end
    it "detects the default value" do
      @doc[:default].should == '/[a-z]/'
    end
  end

  describe "cfg with implicit default array value" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: [1, 2, 3] })
      EOS
    end
    it "detects the default value" do
      @doc[:default].should == '[1, 2, 3]'
    end
  end

  describe "cfg with implicit default object value" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: {foo: 3, bar: "2"} })
      EOS
    end
    it "detects the default value" do
      @doc[:default].should == '{foo: 3, bar: "2"}'
    end
  end

  describe "cfg with implicit string value starting with Ext.baseCSSPrefix" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo Something
         */
        foo: Ext.baseCSSPrefix + "foo" })
      EOS
    end
    it "replaces Ext.baseCSSPrefix with 'x-'" do
      @doc[:default].should == 'Ext.baseCSSPrefix + "foo"'
    end
  end

  describe "cfg with implicit number value given as expression" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg {Number} foo
         */
        foo: 5 + 5 })
      EOS
    end
    it "detects the literal expression from code" do
      @doc[:default].should == "5 + 5"
    end
  end

  describe "cfg with implicit array value with chained method" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg {Array} foo
         */
        foo: [1, 2, 3].compact() })
      EOS
    end
    it "doesn't get the default value from code" do
      @doc[:default].should == nil
    end
  end

  describe "cfg with implicit name followed by code field with another name" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg foo
         */
        bar: true })
      EOS
    end
    it "doesn't get the default value from code" do
      @doc[:default].should == nil
    end
    it "doesn't get the type from code" do
      @doc[:type].should == "Object"
    end
  end

  describe "cfg without implicit name followed by code" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @cfg
         */
        bar: true })
      EOS
    end
    it "gets default value from code" do
      @doc[:default].should == "true"
    end
    it "gets the type from code" do
      @doc[:type].should == "Boolean"
    end
  end

end
