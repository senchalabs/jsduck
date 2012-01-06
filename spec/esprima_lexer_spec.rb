require "jsduck/esprima_lexer"

describe JsDuck::EsprimaLexer do

  def lexer(input)
    JsDuck::EsprimaLexer.new(input)
  end

  describe "empty?" do
    it "is true when no tokens" do
      lexer("").empty?.should == true
    end

    it "is false when there are tokens" do
      lexer(";").empty?.should == false
    end
  end

  describe "next()" do
    it "gives value of next token" do
      lexer("var x;").next.should == :var
    end

    it "gives value of the n-th token when called n times" do
      lex = lexer("var x;")
      lex.next
      lex.next
      lex.next.should == ";"
    end
  end

  describe "next(true)" do
    it "gives full next token" do
      lexer(";").next(true).should == {:type => :operator, :value => ";"}
    end
  end

  describe "look()" do
    it "is true when all params match" do
      lexer("var x = 10;").look(:var, "x", "=").should == true
    end

    it "is false when at least one param doesn't match" do
      lexer("var x = 10;").look(:var, "y", "=").should == false
    end

    it "is false when not enough tokens" do
      lexer(";").look(";", :var).should == false
    end
  end

end

