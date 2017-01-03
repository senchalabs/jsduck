require "jsduck/js_parser"

describe JsDuck::JsParser do

  def parse(input)
    JsDuck::JsParser.new(input).parse
  end

  describe "parsing two comments" do
    before do
      @docs = parse(<<-EOS)
        /* Hello world
        */

        // Another
      EOS
    end

    it "detects 1-based line number of comment on first line" do
      @docs[0][:linenr].should == 1
    end

    it "detects line number of second comment on 4th line" do
      @docs[1][:linenr].should == 4
    end
  end

  describe "parsing line comment" do
    before do
      @docs = parse("// Hello world")
    end

    it "results in plain comment" do
      @docs[0][:type].should == :plain_comment
    end
  end

  describe "parsing block comment" do
    before do
      @docs = parse("/* Hello world */")
    end

    it "results in plain comment" do
      @docs[0][:type].should == :plain_comment
    end

    it "doesn't strip anything from the beginning of comment" do
      @docs[0][:comment].should == " Hello world "
    end
  end

  describe "parsing block comment beginning with /**" do
    before do
      @docs = parse("/** Hello world */")
    end

    it "results in doc comment" do
      @docs[0][:type].should == :doc_comment
    end

    it "strips * at the beginning of comment" do
      @docs[0][:comment].should == " Hello world "
    end
  end

  describe "parsing comment after function" do
    before do
      @docs = parse(<<-EOS)
        function a() {
        }
        // Function A
      EOS
    end

    it "detects no code associated with comment" do
      @docs[0][:code].should == nil
    end
  end

  describe "parsing two comments each before function" do
    before do
      @docs = parse(<<-EOS)
        // Function A
        function a() {
        }
        // Function B
        function b() {
        }
      EOS
    end

    it "finds two comments" do
      @docs.length.should == 2
    end

    it "detects first comment as belonging to first function" do
      @docs[0][:comment].should == " Function A"
      @docs[0][:code]["type"].should == "FunctionDeclaration"
      @docs[0][:code]["id"]["name"].should == "a"
    end

    it "detects second comment as belonging to second function" do
      @docs[1][:comment].should == " Function B"
      @docs[1][:code]["type"].should == "FunctionDeclaration"
      @docs[1][:code]["id"]["name"].should == "b"
    end
  end

  describe "parsing two block comments before one function" do
    before do
      @docs = parse(<<-EOS)
        /* Function A */
        /* Function B */
        function b() {
        }
      EOS
    end

    it "finds two comments" do
      @docs.length.should == 2
    end

    it "detects no code associated with first comment" do
      @docs[0][:code].should == nil
    end

    it "detects second comment as belonging to the function" do
      @docs[1][:code]["type"].should == "FunctionDeclaration"
    end
  end

  describe "parsing three line comments before one function" do
    before do
      @docs = parse(<<-EOS)
        // Very
        // Long
        // Comment
        function b() {
        }
      EOS
    end

    it "finds one comment" do
      @docs.length.should == 1
    end

    it "merges all the line-comments together" do
      @docs[0][:comment].should == " Very\n Long\n Comment"
    end

    it "detects the whole comment as belonging to the function" do
      @docs[0][:code]["type"].should == "FunctionDeclaration"
    end
  end

  describe "parsing three separated line comments before one function" do
    before do
      @docs = parse(<<-EOS)
        // Three

        // Separate


        // Comments
        function b() {
        }
      EOS
    end

    it "gets treated as three separate comments" do
      @docs.length.should == 3
    end
  end

  describe "parsing 2 x two line comments before one function" do
    before do
      @docs = parse(<<-EOS)
        // First
        // Comment for A
        function a() {
        }
        // Second
        // Comment for B
        function b() {
        }
      EOS
    end

    it "finds two comments" do
      @docs.length.should == 2
    end

    it "merges first two line-comments together" do
      @docs[0][:comment].should == " First\n Comment for A"
    end

    it "merges second two line-comments together" do
      @docs[1][:comment].should == " Second\n Comment for B"
    end
  end

  describe "parsing a comment before inner function" do
    before do
      @docs = parse(<<-EOS)
        function x() {
            // Function A
            function a() {
            }
        }
      EOS
    end

    it "detects comment as belonging to the inner function" do
      @docs[0][:code]["type"].should == "FunctionDeclaration"
      @docs[0][:code]["id"]["name"].should == "a"
    end
  end

  describe "parsing heavily nested comment" do
    before do
      @docs = parse(<<-EOS)
        (function () {
            if (true) {
            } else {
                var i;
                for (i=0; i<10; i++) {
                    // Function A
                    function a() {
                    }
                }
             }
        })();
      EOS
    end

    it "detects comment as belonging to the inner function" do
      @docs[0][:code]["type"].should == "FunctionDeclaration"
      @docs[0][:code]["id"]["name"].should == "a"
    end
  end

  describe "parsing comment before object property" do
    before do
      @docs = parse(<<-EOS)
          var x = {
              foo: 5,
              // Some docs
              bar: 5
          }
      EOS
    end

    it "detects comment as belonging to the second property" do
      @docs[0][:code]["type"].should == "Property"
      @docs[0][:code]["key"]["name"].should == "bar"
    end
  end

  describe "parsing comment immediately before object literal" do
    before do
      @docs = parse(<<-EOS)
          x = /* Blah */{};
      EOS
    end

    it "associates comment with the code" do
      @docs[0][:comment].should == " Blah "
      @docs[0][:code]["type"].should == "ObjectExpression"
    end
  end

end
