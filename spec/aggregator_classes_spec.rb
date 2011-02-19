require "jsduck/aggregator"
require "jsduck/parser"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Parser.new(string).parse)
    agr.result
  end

  shared_examples_for "class" do
    it "creates class" do
      @doc[:tagname].should == :class
    end
    it "detects name" do
      @doc[:name].should == "MyClass"
    end
  end

  describe "explicit class" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @extends Your.Class
         * Some documentation.
         * @singleton
         * @xtype nicely
         */
      EOS
    end

    it_should_behave_like "class"
    it "detects extends" do
      @doc[:extends] == "Your.Class"
    end
    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Some documentation."
    end
    it "detects singleton" do
      @doc[:singleton].should == true
    end
    it "detects xtype" do
      @doc[:xtype].should == "nicely"
    end
  end

  describe "function after doc-comment" do
    before do
      @doc = parse("/** */ function MyClass() {}")[0]
    end
    it_should_behave_like "class"
  end

  describe "lambda function after doc-comment" do
    before do
      @doc = parse("/** */ MyClass = function() {}")[0]
    end
    it_should_behave_like "class"
  end

  describe "class name in both code and doc-comment" do
    before do
      @doc = parse("/** @class MyClass */ function YourClass() {}")[0]
    end
    it_should_behave_like "class"
  end

  shared_examples_for "not class" do
    it "does not imply class" do
      @doc[:tagname].should_not == :class
    end
  end

  describe "function beginning with underscore" do
    before do
      @doc = parse("/** */ function _Foo() {}")[0]
    end
    it_should_behave_like "not class"
  end

  describe "lowercase function name" do
    before do
      @doc = parse("/** */ function foo() {}")[0]
    end
    it_should_behave_like "not class"
  end

  describe "Ext.extend() in code" do
    before do
      @doc = parse("/** */ MyClass = Ext.extend(Your.Class, {  });")[0]
    end
    it_should_behave_like "class"
    it "detects implied extends" do
      @doc[:extends].should == "Your.Class"
    end
  end

  describe "Ext.define() in code" do
    before do
      @doc = parse("/** */ Ext.define('MyClass', { extend: 'Your.Class' });")[0]
    end
    it_should_behave_like "class"
    it "detects implied extends" do
      @doc[:extends].should == "Your.Class"
    end
  end

  describe "class with cfgs" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @extends Bar
         * Comment here.
         * @cfg {String} foo Hahaha
         * @private
         * @cfg {Boolean} bar Hihihi
         */
      EOS
    end

    it_should_behave_like "class"
    it "has needed number of configs" do
      @doc[:cfg].length.should == 2
    end
    it "picks up names of all configs" do
      @doc[:cfg][0][:name].should == "foo"
      @doc[:cfg][1][:name].should == "bar"
    end
    it "marks first @cfg as private" do
      @doc[:cfg][0][:private].should == true
    end
  end

  describe "class with constructor" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * Comment here.
         * @constructor
         * This constructs the class
         * @param {Number} nr
         */
      EOS
    end

    it_should_behave_like "class"
    it "has one method" do
      @doc[:method].length.should == 1
    end
    it "has method with name 'constructor'" do
      @doc[:method][0][:name].should == "constructor"
    end
    it "has method with needed parameters" do
      @doc[:method][0][:params].length.should == 1
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
         * @xtype nicely
         */
      EOS
    end

    it_should_behave_like "class"
    it "detects xtype" do
      @doc[:xtype].should == "nicely"
    end
  end

  describe "member docs after class doc" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class
         */
        var MyClass = Ext.extend(Ext.Panel, {
          /**
           * @cfg
           */
          fast: false,
          /**
           * @property
           */
          length: 0,
          /**
           */
          doStuff: function() {
            this.addEvents(
              /**
               * @event
               */
              'touch'
            );
          }
        });
      EOS
      @doc = @classes[0]
    end
    it "results in only one item" do
      @classes.length.should == 1
    end
    it_should_behave_like "class"
    it "should have configs" do
      @doc[:cfg].length.should == 1
    end
    it "should have properties" do
      @doc[:property].length.should == 1
    end
    it "should have method" do
      @doc[:method].length.should == 1
    end
    it "should have events" do
      @doc[:event].length.should == 1
    end
  end

  describe "multiple classes" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class
         */
        function Foo(){}
        /**
         * @class
         */
        function Bar(){}
      EOS
    end

    it "results in multiple classes" do
      @classes.length.should == 2
    end

    it "both are class tags" do
      @classes[0][:tagname] == :class
      @classes[1][:tagname] == :class
    end

    it "names come in order" do
      @classes[0][:name] == "Foo"
      @classes[1][:name] == "Bar"
    end
  end

  describe "one class many times" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class Foo
         * @cfg c1
         */
          /** @method fun1 */
          /** @event eve1 */
          /** @property prop1 */
        /**
         * @class Foo
         * @extends Bar
         * Second description.
         * @xtype xfoo
         * @private
         * @cfg c2
         */
          /** @method fun2 */
          /** @event eve3 */
          /** @property prop2 */
        /**
         * @class Foo
         * @extends Bazaar
         * @singleton
         * Third description.
         * @xtype xxxfoo
         * @cfg c3
         */
          /** @method fun3 */
          /** @event eve3 */
          /** @property prop3 */
      EOS
    end

    it "results in only one class" do
      @classes.length.should == 1
    end

    it "takes class doc from first doc-block that has one" do
      @classes[0][:doc].should == "Second description."
    end

    it "takes @extends from first doc-block that has one" do
      @classes[0][:extends].should == "Bar"
    end

    it "takes @xtype from first doc-block that has one" do
      @classes[0][:xtype].should == "xfoo"
    end

    it "is singleton when one doc-block is singleton" do
      @classes[0][:singleton].should == true
    end

    it "is private when one doc-block is private" do
      @classes[0][:private].should == true
    end

    it "combines all configs" do
      @classes[0][:cfg].length.should == 3
    end

    it "combines all methods, events, properties" do
      @classes[0][:method].length.should == 3
      @classes[0][:event].length.should == 3
      @classes[0][:property].length.should == 3
    end
  end

end
