require "jsduck/lexer"
require "test/unit"

class TestLexer < Test::Unit::TestCase

  def assert_tokens(source, expected_tokens)
    lex = JsDuck::Lexer.new(source)
    expected_tokens.each do |t|
      assert_equal({:type => t[0], :value => t[1]}, lex.next(true))
    end
    assert(lex.empty?)
  end

  def test_simple
    assert_tokens("var foo = 8;",
                  [
                   [:ident, "var"],
                   [:ident, "foo"],
                   [:operator, "="],
                   [:number, 8],
                   [:operator, ";"]
                  ])
  end

  def test_regex_vs_division
    assert_tokens("x = /  /; y / 2",
                  [
                   [:ident, "x"],
                   [:operator, "="],
                   [:regex, "/  /"],
                   [:operator, ";"],
                   [:ident, "y"],
                   [:operator, "/"],
                   [:number, 2]
                  ])
  end

  def test_strings
    d = '"' # double-quote
    s = "'" # single-quote
    b = "\\" # backslash
    assert_tokens(d+s+d   + ' "blah"', [[:string, s], [:string, "blah"]])
    assert_tokens(s+d+s   + ' "blah"', [[:string, d], [:string, "blah"]])
    assert_tokens(d+b+d+d + ' "blah"', [[:string, d], [:string, "blah"]])
    assert_tokens(s+b+s+s + ' "blah"', [[:string, s], [:string, "blah"]])
  end

  def test_comments
    assert_tokens("a // foo\n b", [[:ident, "a"], [:ident, "b"]])
    assert_tokens("a /* foo */ b", [[:ident, "a"], [:ident, "b"]])
  end

  def test_tokens_until_file_end
    assert_tokens("// ", [])
    assert_tokens("/* ", [])
    assert_tokens("/** ", [[:doc_comment, "/** "]])
  end

  def test_doc_comment
    assert_tokens("/** foo */", [[:doc_comment, "/** foo */"]])
  end
end

