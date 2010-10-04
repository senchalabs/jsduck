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

  def test_single_doc_comment
    assert_equal("Hello", JsDuck.parse("/**\nHello\n*/")[0].doc )
  end

end

