require "jsduck/esprima_lexer"

describe JsDuck::EsprimaLexer do

  before do
    @lexer = JsDuck::EsprimaLexer.new
  end

  describe "comment injection" do
    it "works with comment in the middle" do
      tokens = [
        {"range" => [0, 11]},     # "use strict"
        {"range" => [12, 12]},    # ;
        # {"range" => [13, 26]},  # /** comment */
        {"range" => [27, 29]},    # var
        {"range" => [31, 33]},    # Foo
        {"range" => [34, 34]},    # ;
      ]
      @lexer.index_of([13, 26], tokens).should == 2
    end

    it "works with comment at the beginning" do
      tokens = [
        # {"range" => [0, 14]},   # /** comment */
        {"range" => [16, 18]},    # var
        {"range" => [20, 22]},    # Foo
        {"range" => [23, 23]},    # ;
      ]
      @lexer.index_of([0, 14], tokens).should == 0
    end

    it "works with comment at the end" do
      tokens = [
        {"range" => [0, 11]},     # "use strict"
        {"range" => [12, 12]},    # ;
        # {"range" => [13, 26]},  # /** comment */
      ]
      @lexer.index_of([13, 26], tokens).should == 2
    end

    it "works when no tokens at all" do
      tokens = [
        # {"range" => [13, 26]},  # /** comment */
      ]
      @lexer.index_of([13, 26], tokens).should == 0
    end

    it "works when just one token before" do
      tokens = [
        {"range" => [0, 11]},     # "use strict"
        # {"range" => [13, 26]},  # /** comment */
      ]
      @lexer.index_of([13, 26], tokens).should == 1
    end

    it "works when just one token after" do
      tokens = [
        # {"range" => [13, 26]},  # /** comment */
        {"range" => [30, 22]},     # "use strict"
      ]
      @lexer.index_of([13, 26], tokens).should == 0
    end
  end

  describe "tokenize" do
    it "places doc-comments to correct spot" do
      @lexer.tokenize("foo = /** */ 3; /** */").map {|t| t["type"] }.should == [
        "Identifier", "Punctuator", "Block", "Numeric", "Punctuator", "Block"
      ]
    end
  end

end

