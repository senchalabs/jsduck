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
    assert_equal("Some function", docs[0][:method][:doc])
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_method_with_var
    docs = JsDuck.parse("
/**
 */
var foo = function(x) {
}
")
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_method_without_var
    docs = JsDuck.parse("
/**
 */
foo = function(x) {
}
")
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_method_in_object_literal
    docs = JsDuck.parse("
/**
 */
foo: function(x) {
}
")
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_method_in_object_literal_string
    docs = JsDuck.parse("
/**
 */
'foo': function(x) {
}
")
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_method_in_prototype
    docs = JsDuck.parse("
/**
 */
Some.Long.prototype.foo = function(x) {
}
")
    assert_equal("foo", docs[0][:method][:name])
    assert_equal("x", docs[0][:param][0][:name])
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
    assert_equal("hello", docs[0][:method][:name])
    assert_equal("Just some function", docs[0][:method][:doc])
  end

  def test_explicit_method_doc_overrides_implicit_code
    docs = JsDuck.parse("
/**
 * @method hello
 * Just some function
 */
function goodby(){}
")
    assert_equal("hello", docs[0][:method][:name])
    assert_equal("Just some function", docs[0][:method][:doc])
  end

  def test_implicit_method_parameters
    docs = JsDuck.parse("
/**
 */
function f(foo, bar, baz){}
")
    params = docs[0][:param]
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
    params = docs[0][:param]
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
    params = docs[0][:param]
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
    params = docs[0][:param]
    assert_equal("foo", params[0][:name])
    assert_equal("String", params[0][:type])
    assert_equal("bar", params[1][:name])
    assert_equal("Number", params[1][:type])
  end

  def test_explicit_class_name_overrides_implicit
    docs = JsDuck.parse("
/**
 * @class my.package.Foo
 * My class
 */
function Bar(){}
")
    assert_equal("my.package.Foo", docs[0][:class][:name])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_uppercase_method_name_implies_class_name
    docs = JsDuck.parse("
/**
 * My class
 */
function Foo(){}
")
    assert_equal("Foo", docs[0][:class][:name])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_uppercase_name_at_chain_end_implies_class_name
    docs = JsDuck.parse("
/**
 * My class
 */
some.namespace.ClassName = function(){}
")
    assert_equal("some.namespace.ClassName", docs[0][:class][:name])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_implicit_extends
    docs = JsDuck.parse("
/**
 * My class
 */
MyClass = Ext.extend(Ext.util.Observable, {
});
")
    assert_equal("MyClass", docs[0][:class][:name])
    assert_equal("Ext.util.Observable", docs[0][:class][:extends])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_implicit_extends_with_var
    docs = JsDuck.parse("
/**
 * My class
 */
var MyClass = Ext.extend(Ext.util.Observable, {
});
")
    assert_equal("MyClass", docs[0][:class][:name])
    assert_equal("Ext.util.Observable", docs[0][:class][:extends])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_cfg
    docs = JsDuck.parse("
/**
 * @cfg
 * My comment
 */
foo: true,
")
    assert_equal("foo", docs[0][:cfg][:name])
    assert_equal("My comment", docs[0][:cfg][:doc])
    assert_equal("Boolean", docs[0][:cfg][:type])
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
    assert_equal("foo", docs[0][:property][:name])
    assert_equal("Boolean", docs[0][:property][:type])
    assert_equal("My comment", docs[0][:property][:doc])
  end

  def test_implicit_property_type
    comment = "
/**
 * @property
 */
"
    docs = JsDuck.parse(comment + "foo: 'haha',")
    assert_equal("String", docs[0][:property][:type])
    docs = JsDuck.parse(comment + "foo: 123,")
    assert_equal("Number", docs[0][:property][:type])
    docs = JsDuck.parse(comment + "foo: /^123/,")
    assert_equal("RegExp", docs[0][:property][:type])
    docs = JsDuck.parse(comment + "foo: true,")
    assert_equal("Boolean", docs[0][:property][:type])
    docs = JsDuck.parse(comment + "foo: false,")
    assert_equal("Boolean", docs[0][:property][:type])
  end

end

