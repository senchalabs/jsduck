require "jsduck"
require "test/unit"
 
class TestJsDuck < Test::Unit::TestCase

  def test_no_doc_comments
    assert_equal([], JsDuck.parse("var foo = 8;") )
  end

  def test_singleline_comment_until_file_end
    assert_equal([], JsDuck.parse("// ") )
  end

  def test_multiline_comment_until_file_end
    assert_equal([], JsDuck.parse("/* ") )
  end

  def test_return
    docs = JsDuck.parse("
/**
 * Some function
 * @return {String} some value
 * on several
 * lines
 */
")
    assert_equal("String", docs[0][:return][:type])
    assert_equal("some value\non several\nlines", docs[0][:return][:doc])
  end

  def test_param
    docs = JsDuck.parse("
/**
 * Some function
 * @param {Number} x value 1
 * @param {Float} y value 2
 */
")
    param1 = docs[0][:param][0]
    assert_equal("Number", param1[:type])
    assert_equal("x", param1[:name])
    assert_equal("value 1\n", param1[:doc])

    param2 = docs[0][:param][1]
    assert_equal("Float", param2[:type])
    assert_equal("y", param2[:name])
    assert_equal("value 2", param2[:doc])
  end

  def test_function
    docs = JsDuck.parse("
/**
 * Some function
 */
function foo(x) {
}
")
    assert_equal("Some function", docs[0][:function][:doc])
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_with_var
    docs = JsDuck.parse("
/**
 */
var foo = function(x) {
}
")
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_without_var
    docs = JsDuck.parse("
/**
 */
foo = function(x) {
}
")
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_in_object_literal
    docs = JsDuck.parse("
/**
 */
foo: function(x) {
}
")
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_in_object_literal_string
    docs = JsDuck.parse("
/**
 */
'foo': function(x) {
}
")
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_in_prototype
    docs = JsDuck.parse("
/**
 */
Some.Long.prototype.foo = function(x) {
}
")
    assert_equal("foo", docs[0][:function][:name])
    assert_equal("x", docs[0][:param][0][:name])
  end

  def test_function_private
    docs = JsDuck.parse("
// no doc-comment for this function
function foo() {
}
")
    assert_equal([], docs)
  end

  def test_explicit_function_doc
    docs = JsDuck.parse("
/**
 * @function hello
 * Just some function
 */
eval('hello = new Function();');
")
    assert_equal("hello", docs[0][:function][:name])
    assert_equal("Just some function", docs[0][:function][:doc])
  end

  def test_explicit_function_doc_overrides_implicit_code
    docs = JsDuck.parse("
/**
 * @function hello
 * Just some function
 */
function goodby(){}
")
    assert_equal("hello", docs[0][:function][:name])
    assert_equal("Just some function", docs[0][:function][:doc])
  end

  def test_implicit_function_parameters
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

  def test_explicit_function_parameters_override_implicit_ones
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

  def test_explicit_class_name
    docs = JsDuck.parse("
/**
 * @class Foo
 * My class
 */
function Bar(){}
")
    assert_equal("Foo", docs[0][:class][:name])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_uppercase_function_name_implies_class_name
    docs = JsDuck.parse("
/**
 * My class
 */
function Foo(){}
")
    assert_equal("Foo", docs[0][:class][:name])
    assert_equal("My class", docs[0][:class][:doc])
  end

  def test_explicit_extends
    docs = JsDuck.parse("
/**
 * @class Foo
 * @extends Bar
 * My class
 */
")
    assert_equal("Foo", docs[0][:class][:name])
    assert_equal("Bar", docs[0][:class][:extends])
    assert_equal("My class", docs[0][:class][:doc])
  end

end

