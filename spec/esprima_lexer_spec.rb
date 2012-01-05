require "jsduck/esprima_lexer"

describe JsDuck::EsprimaLexer do

  def tokenize(js)
    @lexer = JsDuck::EsprimaLexer.new
    @lexer.tokenize(js).map {|t| t["type"] }
  end

  describe "tokenize" do
    it "works with comment in the middle" do
      tokenize("foo = /** */ 3;").should == [
        "Identifier", "Punctuator", "Block", "Numeric", "Punctuator"
      ]
    end

    it "works with comment at the beginning" do
      tokenize("/** */ var Foo;").should == [
        "Block", "Keyword", "Identifier", "Punctuator"
      ]
    end

    it "works with comment at the end" do
      tokenize("'use strict'; /** */").should == [
        "String", "Punctuator", "Block"
      ]
    end

    it "works when only comment" do
      tokenize(" /** I am comment*/ ").should == [
        "Block"
      ]
    end

    it "works when just one token before comment" do
      tokenize(" ; /** I am comment*/ ").should == [
        "Punctuator", "Block"
      ]
    end

    it "works when just one token after comment" do
      tokenize(" /** I am comment*/ z").should == [
        "Block", "Identifier"
      ]
    end
  end

end

