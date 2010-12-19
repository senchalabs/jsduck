require "jsduck"
require "test/unit"

class TestJsDuck < Test::Unit::TestCase

  def test_explicit_class
    docs = JsDuck.parse("/**
 * @class My.nice.Class
 * @extends Your.Class
 * A good class indeed.
 * @singleton
 * @xtype nicely
 */")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("My.nice.Class", docs[0][:name])
    assert_equal("Your.Class", docs[0][:extends])
    assert_equal("A good class indeed.", docs[0][:doc])
    assert_equal(true, docs[0][:singleton])
    assert_equal("nicely", docs[0][:xtype])
  end

  def test_implicit_class_name_from_function
    docs = JsDuck.parse("/**
 */
function MyClass() {}
")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("MyClass", docs[0][:name])
  end

  def test_implicit_class_name_from_function
    docs = JsDuck.parse("/**
 */
function MyClass() {}
")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("MyClass", docs[0][:name])
  end

  def test_implicit_class_name_from_lambda
    docs = JsDuck.parse("/**
 */
My.Class = function(a,b,c) {}
")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("My.Class", docs[0][:name])
  end

  def test_explicit_class_name_overrides_implicit
    docs = JsDuck.parse("
/**
 * @class Foo
 */
function Bar(){}
")
    assert_equal("Foo", docs[0][:name])
  end

  def test_underscore_does_not_imply_class_name
    # name beginning with uppercase letter is assumed to be class name,
    # but we have to ensure that "_" is not treated as uppercase letter.
    docs = JsDuck.parse("
/** */
_blah = {}
")
    assert_equal(:property, docs[0][:tagname])
  end

  def test_implicit_extends
    docs = JsDuck.parse("
/**
 */
MyClass = Ext.extend(Ext.util.Observable, {
});
")
    assert_equal("MyClass", docs[0][:name])
    assert_equal("Ext.util.Observable", docs[0][:extends])
  end

  def test_class_with_cfgs
    docs = JsDuck.parse("/**
 * @class Foo
 * @extends Bar
 * Comment here.
 * @cfg {String} foo Hahaha
 * @private
 * @cfg {Boolean} bar Hihihi
 */")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("Foo", docs[0][:name])
    assert_equal("Bar", docs[0][:extends])
    assert_equal("Comment here.", docs[0][:doc])

    cfgs = docs[0][:cfg]
    assert_equal(2, cfgs.length)

    assert_equal(:cfg, cfgs[0][:tagname])
    assert_equal("String", cfgs[0][:type])
    assert_equal("foo", cfgs[0][:name])
    assert_equal("Hahaha", cfgs[0][:doc])
    assert_equal(true, cfgs[0][:private])

    assert_equal(:cfg, cfgs[1][:tagname])
    assert_equal("Boolean", cfgs[1][:type])
    assert_equal("bar", cfgs[1][:name])
    assert_equal("Hihihi", cfgs[1][:doc])
  end

  def test_class_with_constructor
    docs = JsDuck.parse("/**
 * @class Foo
 * Comment here.
 * @constructor
 * This constructs the class
 * @param {Number} nr
 */")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("Foo", docs[0][:name])

    methods = docs[0][:method]
    assert_equal(1, methods.length)
    assert_equal(:method, methods[0][:tagname])
    assert_equal("constructor", methods[0][:name])

    params = methods[0][:params]
    assert_equal("nr", params[0][:name])
    assert_equal("Number", params[0][:type])
  end

  def test_xtype_after_constructor
    docs = JsDuck.parse("/**
 * @class Foo
 * Comment here.
 * @constructor
 * Often in ExtJS the xtype tag follows constructor tag.
 * @xtype blah
 */")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("blah", docs[0][:xtype])
  end

  def test_implicit_property_type
    comment = "
/**
 * @property
 */
"
    docs = JsDuck.parse(comment + "foo: 'haha',")
    assert_equal("String", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: 123,")
    assert_equal("Number", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: /^123/,")
    assert_equal("RegExp", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: true,")
    assert_equal("Boolean", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: false,")
    assert_equal("Boolean", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: function(){},")
    assert_equal("Function", docs[0][:type])
    docs = JsDuck.parse(comment + "function foo(){},")
    assert_equal("Function", docs[0][:type])
  end

  def test_visibility_modifiers
    ["@private", "@hide", "@ignore", "@protected"].each do |tagname|
      docs = JsDuck.parse("/**\n * #{tagname}\n */");
      assert_equal(true, docs[0][:private])
    end
  end

  def test_static_method
    docs = JsDuck.parse("/**
 * @method
 * @static
 */");
    assert_equal(true, docs[0][:static])
  end

  def test_static_property
    docs = JsDuck.parse("/**
 * @property
 * @static
 */");
    assert_equal(true, docs[0][:static])
  end

  def test_member_docs_following_class
    docs = JsDuck.parse("
/**
 * @class
 */
var MyPanel = Ext.extend(Ext.Panel, {
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
")
    assert_equal(:class, docs[0][:tagname])
    assert_equal("MyPanel", docs[0][:name])

    cfgs = docs[0][:cfg]
    assert_equal(1, cfgs.length)
    assert_equal(:cfg, cfgs[0][:tagname])
    assert_equal("fast", cfgs[0][:name])

    props = docs[0][:property]
    assert_equal(1, props.length)
    assert_equal(:property, props[0][:tagname])
    assert_equal("length", props[0][:name])

    methods = docs[0][:method]
    assert_equal(1, methods.length)
    assert_equal(:method, methods[0][:tagname])
    assert_equal("doStuff", methods[0][:name])

    events = docs[0][:event]
    assert_equal(1, events.length)
    assert_equal(:event, events[0][:tagname])
    assert_equal("touch", events[0][:name])
  end

  def test_multiple_classes
    docs = JsDuck.parse("
/**
 * @class
 */
function Foo(){}
/**
 * @class
 */
function Bar(){}
")
    assert_equal(2, docs.length)
    assert_equal(:class, docs[0][:tagname])
    assert_equal("Foo", docs[0][:name])
    assert_equal(:class, docs[1][:tagname])
    assert_equal("Bar", docs[1][:name])
  end

end

