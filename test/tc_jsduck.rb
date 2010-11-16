require "jsduck"
require "test/unit"

class TestJsDuck < Test::Unit::TestCase

  def test_method
    docs = JsDuck.parse("
/**
 * Some function
 */
function foo(x) {
}
")
    assert_equal(:method, docs[0][:tagname])
    assert_equal("Some function", docs[0][:doc])
    assert_equal("foo", docs[0][:name])
    assert_equal(1, docs[0][:params].length)
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_with_var
    docs = JsDuck.parse("
/**
 */
var foo = function(x) {
}
")
    assert_equal("foo", docs[0][:name])
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_without_var
    docs = JsDuck.parse("
/**
 */
foo = function(x) {
}
")
    assert_equal("foo", docs[0][:name])
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_in_object_literal
    docs = JsDuck.parse("
/**
 */
foo: function(x) {
}
")
    assert_equal("foo", docs[0][:name])
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_in_object_literal_string
    docs = JsDuck.parse("
/**
 */
'foo': function(x) {
}
")
    assert_equal("foo", docs[0][:name])
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_in_prototype
    docs = JsDuck.parse("
/**
 */
Some.Long.prototype.foo = function(x) {
}
")
    assert_equal("foo", docs[0][:name])
    assert_equal("x", docs[0][:params][0][:name])
  end

  def test_method_private
    docs = JsDuck.parse("
// no doc-comment for this function
function foo() {
}
")
    assert_equal([], docs)
  end

  def test_explicit_method_doc
    docs = JsDuck.parse("
/**
 * @method hello
 * Just some function
 */
eval('hello = new Function();');
")
    assert_equal("hello", docs[0][:name])
    assert_equal("Just some function", docs[0][:doc])
  end

  def test_explicit_method_doc_overrides_implicit_code
    docs = JsDuck.parse("
/**
 * @method hello
 * Just some function
 */
function goodby(){}
")
    assert_equal("hello", docs[0][:name])
    assert_equal("Just some function", docs[0][:doc])
  end

  def test_implicit_method_parameters
    docs = JsDuck.parse("
/**
 */
function f(foo, bar, baz){}
")
    params = docs[0][:params]
    assert_equal("foo", params[0][:name])
    assert_equal("bar", params[1][:name])
    assert_equal("baz", params[2][:name])
  end

  def test_explicit_method_parameters_override_implicit_ones
    docs = JsDuck.parse("
/**
 * @param {String} x
 * @param {String} y
 * @param {String} z
 */
function f(foo, bar, baz){}
")
    params = docs[0][:params]
    assert_equal("x", params[0][:name])
    assert_equal("y", params[1][:name])
    assert_equal("z", params[2][:name])
  end

  def test_some_explicit_and_some_implicit_parameters
    docs = JsDuck.parse("
/**
 * @param {String} x
 */
function f(foo, bar){}
")
    params = docs[0][:params]
    assert_equal("x", params[0][:name])
    assert_equal("bar", params[1][:name])
  end

  def test_explicit_parameter_types_and_implicit_names
    docs = JsDuck.parse("
/**
 * @param {String}
 * @param {Number}
 */
function f(foo, bar){}
")
    params = docs[0][:params]
    assert_equal("foo", params[0][:name])
    assert_equal("String", params[0][:type])
    assert_equal("bar", params[1][:name])
    assert_equal("Number", params[1][:type])
  end

  def test_description_can_precede_method_tag
    docs = JsDuck.parse("/**
 * Method description
 * @param foo
 * @method blah
 */")
    assert_equal("blah", docs[0][:name])
    assert_equal("Method description", docs[0][:doc])
    assert_equal("foo", docs[0][:params][0][:name])
  end

  def test_return
    docs = JsDuck.parse("/**
 * @method foo
 * Method description
 * @return {String} Some really
 * long comment.
 */")
    assert_equal("String", docs[0][:return][:type])
    assert_equal("Some really\nlong comment.", docs[0][:return][:doc])
  end

  def test_returns_is_alias_for_return
    docs = JsDuck.parse("/**
 * @method
 * @returns {String} blah
 */")
    assert_equal("String", docs[0][:return][:type])
    assert_equal("blah", docs[0][:return][:doc])
  end

  def test_typeless_param_and_return
    docs = JsDuck.parse("/**
 * @method
 * @param x doc1
 * @return doc2
 */")
    assert_equal("x", docs[0][:params][0][:name])
    assert_equal("doc1", docs[0][:params][0][:doc])
    assert_equal("doc2", docs[0][:return][:doc])

    assert_equal(nil, docs[0][:params][0][:type])
    assert_equal(nil, docs[0][:return][:type])
  end

  def test_event
    docs = JsDuck.parse("/**
 * @event mousedown
 * Fires when the mouse button is depressed.
 * @param {String} foo  Comment 1
 * @param {Number} bar  Comment 2
 */")
    assert_equal(:event, docs[0][:tagname])
    assert_equal("mousedown", docs[0][:name])
    assert_equal("Fires when the mouse button is depressed.", docs[0][:doc])
    params = docs[0][:params]
    assert_equal("foo", params[0][:name])
    assert_equal("String", params[0][:type])
    assert_equal("Comment 1", params[0][:doc])
    assert_equal("bar", params[1][:name])
    assert_equal("Number", params[1][:type])
    assert_equal("Comment 2", params[1][:doc])
  end

  def test_implicit_event_name_as_string
    docs = JsDuck.parse("/**
 * @event
 */
'mousedown',
")
    assert_equal(:event, docs[0][:tagname])
    assert_equal("mousedown", docs[0][:name])
  end

  def test_implicit_event_name_as_property
    docs = JsDuck.parse("/**
 * @event
 */
mousedown: true,
")
    assert_equal(:event, docs[0][:tagname])
    assert_equal("mousedown", docs[0][:name])
  end

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

  def test_cfg
    docs = JsDuck.parse("
/**
 * @cfg
 * My comment
 */
foo: true,
")
    assert_equal(:cfg, docs[0][:tagname])
    assert_equal("foo", docs[0][:name])
    assert_equal("My comment", docs[0][:doc])
    assert_equal("Boolean", docs[0][:type])
  end

  def test_property
    docs = JsDuck.parse("
/**
 * @property
 * @type Boolean
 * My comment
 */
foo: true,
")
    assert_equal(:property, docs[0][:tagname])
    assert_equal("foo", docs[0][:name])
    assert_equal("Boolean", docs[0][:type])
    assert_equal("My comment", docs[0][:doc])
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

