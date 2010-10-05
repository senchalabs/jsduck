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

  def test_function
    docs = JsDuck.parse("
/**
 * Some function
 */
function foo() {
}
")
    assert_equal("Some function", docs[0].doc)
    assert_equal("foo", docs[0].function)
  end

  def test_function_with_var
    docs = JsDuck.parse("
/**
 */
var foo = function() {
}
")
    assert_equal("foo", docs[0].function)
  end

  def test_function_without_var
    docs = JsDuck.parse("
/**
 */
foo = function() {
}
")
    assert_equal("foo", docs[0].function)
  end

  def test_function_in_object_literal
    docs = JsDuck.parse("
/**
 */
foo: function() {
}
")
    assert_equal("foo", docs[0].function)
  end

  def test_function_in_object_literal_string
    docs = JsDuck.parse("
/**
 */
'foo': function() {
}
")
    assert_equal("foo", docs[0].function)
  end

  def test_function_private
    docs = JsDuck.parse("
// no doc-comment for this function
function foo() {
}
")
    assert_equal(0, docs.length)
  end
end

