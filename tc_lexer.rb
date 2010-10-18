require "lexer"
require "test/unit"
 
class TestLexer < Test::Unit::TestCase

  def assert_tokens(source, expected_tokens)
    lex = JsDuck::Lexer.new(source)
    expected_tokens.each do |t|
      assert_equal({:type => t[0], :value => t[1]}, lex.next(true))
    end
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
    assert_tokens(d+s+d + ' "blah"', [[:string, s]])
    assert_tokens(s+d+s + ' "blah"', [[:string, d]])
    assert_tokens(d+b+d+d + ' "blah"', [[:string, d]])
    assert_tokens(s+b+s+s + ' "blah"', [[:string, s]])
  end

  def test_comments
    assert_tokens("a // foo\n b", [[:ident, "a"], [:ident, "b"]])
    assert_tokens("a /* foo */ b", [[:ident, "a"], [:ident, "b"]])
  end

  def test_doc_comment
    lex = JsDuck::Lexer.new("/** foo */")
    assert_equal(:doc_comment, lex.next(true)[:type])
  end
end

