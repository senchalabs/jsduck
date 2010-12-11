require "jsduck/lexer"

describe JsDuck::Lexer do

  def lex(source)
    lex = JsDuck::Lexer.new(source)
    tokens = []
    while !lex.empty?
      t = lex.next(true)
      tokens << [t[:type], t[:value]]
    end
    tokens
  end

  it "tokenizes simple expression" do
    lex("var foo = 8;").should == [
      [:keyword, "var"],
      [:ident, "foo"],
      [:operator, "="],
      [:number, 8],
      [:operator, ";"]
    ]
  end

  describe "differenciates regex from division" do

    it "when regex after operator" do
      lex("x = /  /; y / 2").should == [
        [:ident, "x"],
        [:operator, "="],
        [:regex, "/  /"],
        [:operator, ";"],
        [:ident, "y"],
        [:operator, "/"],
        [:number, 2]
      ]
    end

    it "when regex after return" do
      lex("return /foo/.test;").should == [
        [:keyword, "return"],
        [:regex, "/foo/"],
        [:operator, "."],
        [:ident, "test"],
        [:operator, ";"]
      ]
    end

    it "when regex after typeof" do
      lex("typeof /foo/;").should == [
        [:keyword, "typeof"],
        [:regex, "/foo/"],
        [:operator, ";"]
      ]
    end

    it "when division after this" do
      lex("this / 3").should == [
        [:keyword, "this"],
        [:operator, "/"],
        [:number, 3]
      ]
    end
  end

  describe "identifies strings" do

    before do
      @d = '"' # double-quote
      @s = "'" # single-quote
      @b = "\\" # backslash
    end

    it "when single-quote inside double-quoted string" do
      lex(@d+@s+@d   + ' "blah"').should == [[:string, @s], [:string, "blah"]]
    end

    it "when double-quote inside single-quoted string" do
      lex(@s+@d+@s   + ' "blah"').should == [[:string, @d], [:string, "blah"]]
    end

    it "when escaped double-quote inside double-quoted string" do
      lex(@d+@b+@d+@d   + ' "blah"').should == [[:string, @d], [:string, "blah"]]
    end

    it "when escaped single-quote inside single-quoted string" do
      lex(@s+@b+@s+@s   + ' "blah"').should == [[:string, @s], [:string, "blah"]]
    end
  end

  it "ignores one-line comments" do
    lex("a // foo\n b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "ignores multi-line comments" do
    lex("a /* foo */ b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "identifies doc-comments" do
    lex("/** foo */").should == [[:doc_comment, "/** foo */"]]
  end

  describe "handles unfinished" do

    it "single-line comment" do
      lex("// ").should == []
    end

    it "multi-line comment" do
      lex("/* ").should == []
    end

    it "doc-comment" do
      lex("/** ").should == [[:doc_comment, "/** "]]
    end
  end

end

