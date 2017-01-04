require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
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
         * @mixins Foo.Mixin Bar.Mixin
         * @alternateClassNames AltClass
         * Some documentation.
         * @singleton
         */
      EOS
    end

    it_should_behave_like "class"
    it "detects extends" do
      @doc[:extends].should == "Your.Class"
    end
    it "detects mixins" do
      Set.new(@doc[:mixins]).should == Set.new(["Foo.Mixin", "Bar.Mixin"])
    end
    it "detects alternate class names" do
      @doc[:alternateClassNames].should == ["AltClass"]
    end
    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Some documentation."
    end
    it "detects singleton" do
      @doc[:singleton].should == true
    end
  end

  describe "class @tag aliases" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @extend Your.Class
         * @mixin My.Mixin
         * @alternateClassName AltClass
         * Some documentation.
         */
      EOS
    end

    it_should_behave_like "class"
    it "@extend treated as alias for @extends" do
      @doc[:extends].should == "Your.Class"
    end
    it "@mixin treated as alias for @mixins" do
      @doc[:mixins].should == ["My.Mixin"]
    end
    it "@alternateClassName treated as alias for @alternateClassNames" do
      @doc[:alternateClassNames].should == ["AltClass"]
    end
  end

  describe "class with multiple @mixins" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @mixins My.Mixin
         * @mixins Your.Mixin Other.Mixin
         * Some documentation.
         */
      EOS
    end

    it_should_behave_like "class"
    it "collects all mixins together" do
      Set.new(@doc[:mixins]).should == Set.new(["My.Mixin", "Your.Mixin", "Other.Mixin"])
    end
  end

  describe "class with multiple @alternateClassNames" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @alternateClassNames AltClass1
         * @alternateClassNames AltClass2
         * Some documentation.
         */
      EOS
    end

    it_should_behave_like "class"
    it "collects all alternateClassNames together" do
      @doc[:alternateClassNames].should == ["AltClass1", "AltClass2"]
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

  shared_examples_for "Ext.define" do
    it_should_behave_like "class"
    it "detects implied extends" do
      @doc[:extends].should == "Your.Class"
    end
    it "detects implied mixins" do
      Set.new(@doc[:mixins]).should == Set.new(["Ext.util.Observable", "Foo.Bar"])
    end
    it "detects implied alternateClassNames" do
      @doc[:alternateClassNames].should == ["JustClass"]
    end
    it "detects implied singleton" do
      @doc[:singleton].should == true
    end
    it "detects required classes" do
      @doc[:requires].should == ["ClassA", "ClassB"]
    end
    it "detects used classes" do
      @doc[:uses].should == ["ClassC"]
    end
  end

  describe "basic Ext.define() in code" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          extend: 'Your.Class',
          mixins: {
            obs: 'Ext.util.Observable',
            bar: 'Foo.Bar'
          },
          alternateClassName: 'JustClass',
          singleton: true,
          requires: ['ClassA', 'ClassB'],
          uses: 'ClassC'
        });
      EOS
    end
    it_should_behave_like "Ext.define"
  end

  describe "Ext.ClassManager.create() instead of Ext.define()" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.ClassManager.create('MyClass', {
        });
      EOS
    end
    it_should_behave_like "class"
  end

  describe "complex Ext.define() in code" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
          blah: true,
          extend: 'Your.Class',
          uses: ['ClassC'],
          conf: {foo: 10},
          singleton: true,
          alternateClassName: ['JustClass'],
          stuff: ["foo", "bar"],
          requires: ['ClassA', 'ClassB'],
          mixins: [
            'Ext.util.Observable',
            'Foo.Bar'
          ]
        });
      EOS
    end
    it_should_behave_like "Ext.define"
  end

  describe "explicit @tags overriding Ext.define()" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @extends Your.Class
         * @uses ClassC
         * @requires ClassA
         * @requires ClassB
         * @alternateClassName JustClass
         * @mixins Ext.util.Observable
         * @mixins Foo.Bar
         * @singleton
         */
        Ext.define('MyClassXXX', {
          extend: 'Your.ClassXXX',
          uses: ['CCC'],
          singleton: false,
          alternateClassName: ['JustClassXXX'],
          requires: ['AAA'],
          mixins: ['BBB']
        });
      EOS
    end
    it_should_behave_like "Ext.define"
  end

  describe "Ext.define() without extend" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define('MyClass', {
        });
      EOS
    end
    it "automatically extends from Ext.Base" do
      @doc[:extends].should == "Ext.Base"
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
    it "has needed number of members" do
      @doc[:members].length.should == 2
    end
    it "detects members as configs" do
      @doc[:members][0][:tagname].should == :cfg
      @doc[:members][1][:tagname].should == :cfg
    end
    it "picks up names of all configs" do
      @doc[:members][0][:name].should == "foo"
      @doc[:members][1][:name].should == "bar"
    end
    it "marks first @cfg as private" do
      @doc[:members][0][:private].should == true
    end
  end

  describe "class with cfgs with subproperties" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * Comment here.
         * @cfg {Object} foo
         * @cfg {String} foo.one
         * @cfg {String} foo.two
         * @cfg {Function} bar
         * @cfg {Boolean} bar.arg
         */
      EOS
    end

    it "detects the configs taking account the subproperties" do
      @doc[:members].length.should == 2
    end
  end

  describe "implicit class with more than one cfg" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Comment here.
         * @cfg {String} foo
         * @cfg {String} bar
         */
        MyClass = function() {}
      EOS
    end
    it_should_behave_like "class"
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

    it "should have 4 members" do
      @doc[:members].length.should == 4
    end
    it "should have a config" do
      @doc[:members][0][:tagname].should == :cfg
    end
    it "should have propertiesy" do
      @doc[:members][1][:tagname].should == :property
    end
    it "should have method" do
      @doc[:members][2][:tagname].should == :method
    end
    it "should have event" do
      @doc[:members][3][:tagname].should == :event
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
         * @mixins Mix1
         * @alternateClassNames AltClassic
         * Second description.
         * @private
         * @cfg c2
         */
          /** @method fun2 */
          /** @event eve3 */
          /** @property prop2 */
        /**
         * @class Foo
         * @extends Bazaar
         * @mixins Mix2
         * @singleton
         * Third description.
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

    it "is singleton when one doc-block is singleton" do
      @classes[0][:singleton].should == true
    end

    it "is private when one doc-block is private" do
      @classes[0][:private].should == true
    end

    it "combines all mixins" do
      @classes[0][:mixins].length.should == 2
    end

    it "combines all alternateClassNames" do
      @classes[0][:alternateClassNames].length.should == 1
    end

    it "combines all members" do
      @classes[0][:members].length.should == 3 * 4
    end
  end

  describe "class Foo following class with Foo as alternateClassName" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class Person
         * @alternateClassName Foo
         */
        /**
         * @class Foo
         */
      EOS
    end

    it "results in only one class" do
      @classes.length.should == 1
    end
  end

  describe "class Foo preceding class with Foo as alternateClassName" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class Foo
         */
        /**
         * @class Person
         * @alternateClassName Foo
         */
      EOS
    end

    it "results in only one class" do
      @classes.length.should == 1
    end
  end

  describe "Class with itself as alternateClassName" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class Foo
         * @alternateClassName Foo
         */
      EOS
    end

    it "results still in one class" do
      @classes.length.should == 1
    end
  end


  shared_examples_for "extending Object" do
    it "has extends == nil" do
      @doc[:extends].should == nil
    end
  end

  describe "Class explicitly extending Object" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class Foo
         * @extends Object
         */
      EOS
    end
    it_should_behave_like "extending Object"
  end

  describe "Ext.define extending Object" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Ext.define("Foo", {extend: "Object"});
      EOS
    end
    it_should_behave_like "extending Object"
  end

  describe "Ext.extend extending Object" do
    before do
      @doc = parse(<<-EOS)[0]
        /** */
        Foo = Ext.extend(Object, { });
      EOS
    end
    it_should_behave_like "extending Object"
  end

  describe "Explicit class without @extends" do
    before do
      @doc = parse(<<-EOS)[0]
        /** @class Foo */
      EOS
    end
    it_should_behave_like "extending Object"
  end
end
