require "jsduck/esprima_parser"

describe JsDuck::EsprimaParser do

  def parse(input)
    JsDuck::EsprimaParser.instance.parse(input)
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

  shared_examples_for "three comments merged" do
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

    it_should_behave_like "three comments merged"
  end

  describe "parsing two separated line comments before one function" do
    before do
      @docs = parse(<<-EOS)
        // Very

        // Long


        // Comment
        function b() {
        }
      EOS
    end

    it_should_behave_like "three comments merged"
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

end

