require "jsduck/lexer"

describe JsDuck::Lexer do

  def lex(source)
    lex = JsDuck::Lexer.new(source)
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

  it "tokenizes simple expression" do
    lex("var foo = 8;").should == [
      [:var, :var],
      [:ident, "foo"],
      [:operator, "="],
      [:number, "8"],
      [:operator, ";"]
    ]
  end

  it "handles $ in identifiers" do
    lex("$fo$o").should == [[:ident, "$fo$o"]]
  end

  it "handles numbers in identifiers" do
    lex("x2").should == [[:ident, "x2"]]
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
        [:number, "2"]
      ]
    end

    it "when regex after return" do
      lex("return /foo/.test;").should == [
        [:return, :return],
        [:regex, "/foo/"],
        [:operator, "."],
        [:ident, "test"],
        [:operator, ";"]
      ]
    end

    it "when regex after typeof" do
      lex("typeof /foo/;").should == [
        [:typeof, :typeof],
        [:regex, "/foo/"],
        [:operator, ";"]
      ]
    end

    it "when division after this" do
      lex("this / 3").should == [
        [:this, :this],
        [:operator, "/"],
        [:number, "3"]
      ]
    end
  end

  it "allows [/] inside regex" do
    lex("/ [/] /").should == [[:regex, "/ [/] /"]]
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
      lex(@d+@b+@d+@d   + ' "blah"').should == [[:string, @b+@d], [:string, "blah"]]
    end

    it "when escaped single-quote inside single-quoted string" do
      lex(@s+@b+@s+@s   + ' "blah"').should == [[:string, @b+@s], [:string, "blah"]]
    end

    it "when newlines escaped inside double-quoted string" do
      lex(@d+"A\\\nB"+@d).should == [[:string, "A\\\nB"]]
    end

    it "when newlines escaped inside single-quoted string" do
      lex(@s+"A\\\nB"+@s).should == [[:string, "A\\\nB"]]
    end
  end

  it "identifies $ as beginning of identifier" do
    lex("$1a").should == [[:ident, "$1a"]]
  end

  it "allows $ as a name of identifier" do
    lex("$ = 3")[0].should == [:ident, "$"]
  end

  it "ignores one-line comments" do
    lex("a // foo\n b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "ignores multi-line comments" do
    lex("a /* foo */ b").should == [[:ident, "a"], [:ident, "b"]]
  end

  it "identifies doc-comments together with line numbers" do
    lex("/** foo */").should == [[:doc_comment, "/** foo */", 1]]
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
      lex("/** ").should == [[:doc_comment, "/** ", 1]]
    end

    it "regex" do
      lex("/[a-z] ").should == [[:regex, "/[a-z] "]]
    end

    it "single-quoted string" do
      lex("' ").should == [[:string, " "]]
    end

    it "double-quoted string" do
      lex('" ').should == [[:string, " "]]
    end
  end

  describe "passing StringScanner to constructor" do
    before do
      @scanner = StringScanner.new("5 + 5")
      @lex = JsDuck::Lexer.new(@scanner)
    end

    it "uses that StringScanner for parsing" do
      @lex.look(:number).should == true
    end

    it "doesn't advance the scan pointer when nothing done" do
      @scanner.rest.should == "5 + 5"
    end

    it "#look doesn't advance the scan pointer" do
      @lex.look(:number)
      @scanner.rest.should == "5 + 5"
    end

    it "#empty? doesn't advance the scan pointer" do
      @lex.empty?
      @scanner.rest.should == "5 + 5"
    end

    it "#next advances the scan pointer only until the end of token (excluding whitespace after token)" do
      @lex.next
      @scanner.rest.should == " + 5"
    end
  end

end

