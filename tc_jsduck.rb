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
function foo() {
}
")
    assert_equal("Some function", docs[0][:function][:doc])
    assert_equal("foo", docs[0][:function][:name])
  end

  def test_function_with_var
    docs = JsDuck.parse("
/**
 */
var foo = function() {
}
")
    assert_equal("foo", docs[0][:function][:name])
  end

  def test_function_without_var
    docs = JsDuck.parse("
/**
 */
foo = function() {
}
")
    assert_equal("foo", docs[0][:function][:name])
  end

  def test_function_in_object_literal
    docs = JsDuck.parse("
/**
 */
foo: function() {
}
")
    assert_equal("foo", docs[0][:function][:name])
  end

  def test_function_in_object_literal_string
    docs = JsDuck.parse("
/**
 */
'foo': function() {
}
")
    assert_equal("foo", docs[0][:function][:name])
  end

  def test_function_private
    docs = JsDuck.parse("
// no doc-comment for this function
function foo() {
}
")
    assert_equal([], docs)
  end
end

