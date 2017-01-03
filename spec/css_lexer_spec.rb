require "jsduck/css_lexer"

describe JsDuck::CssLexer do

  def lex(source)
    lex = JsDuck::CssLexer.new(source)
    tokens = []
    while !lex.empty?
      t = lex.next(true)
      tokens << [t[:type], t[:value]]
      if t[:linenr]
        tokens.last << t[:linenr]
      end
    end
    tokens
  end

  it "tokenizes simple selector" do
    lex("a { font-size: 3em; }").should == [
      [:ident, "a"],
      [:delim, "{"],
      [:ident, "font-size"],
      [:delim, ":"],
      [:dimension, "3em"],
      [:delim, ";"],
      [:delim, "}"],
    ]
  end

  it "tokenizes simple at-rule" do
    lex("@foo;").should == [[:at_keyword, "@foo"], [:delim, ";"]]
  end

  it "tokenizes color value" do
    lex("color: #cc00FF;").should == [[:ident, "color"], [:delim, ":"], [:hash, "#cc00FF"], [:delim, ";"]]
  end

  it "tokenizes various numbers" do
    lex("10 5.6 .14").should == [[:number, "10"], [:number, "5.6"], [:number, ".14"]]
  end

  it "identifies SCSS variable" do
    lex("$foo-bar").should == [[:var, "$foo-bar"]]
  end

  describe "identifies strings" do

    before do
      @d = '"' # double-quote
      @s = "'" # single-quote
      @b = "\\" # backslash
    end

    it "when single-quote inside double-quoted string" do
      lex(@d+@s+@d   + ' "blah"').should == [[:string, @d+@s+@d], [:string, '"blah"']]
    end

    it "when double-quote inside single-quoted string" do
      lex(@s+@d+@s   + ' "blah"').should == [[:string, @s+@d+@s], [:string, '"blah"']]
    end

    it "when escaped double-quote inside double-quoted string" do
      lex(@d+@b+@d+@d   + ' "blah"').should == [[:string, @d+@b+@d+@d], [:string, '"blah"']]
    end

    it "when escaped single-quote inside single-quoted string" do
      lex(@s+@b+@s+@s   + ' "blah"').should == [[:string, @s+@b+@s+@s], [:string, '"blah"']]
    end
  end

  it "ignores one-line comments" do
    lex("a // foo\n b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "ignores multi-line comments" do
    lex("a /* foo */ b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "ignores empty multi-line comments" do
    lex("a /**/ b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "identifies doc-comments together with line numbers" do
    lex("/** foo */").should == [[:doc_comment, " foo ", 1]]
  end

  it "counts line numbers correctly" do
    tokens = lex(<<-EOS)
      foo = {
        bar: foo,
        /**
         * My comment.
         */
    EOS
    tokens.last.last.should == 3
  end

  describe "handles unfinished" do

    it "single-line comment" do
      lex("// ").should == []
    end

    it "multi-line comment" do
      lex("/* ").should == []
    end

    it "doc-comment" do
      lex("/** ").should == [[:doc_comment, " ", 1]]
    end

    it "single-quoted string" do
      lex("' ").should == [[:string, "' "]]
    end

    it "double-quoted string" do
      lex('" ').should == [[:string, '" ']]
    end
  end

end

