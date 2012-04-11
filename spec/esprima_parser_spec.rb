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

  describe "parsing two comments before one function" do
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


end

