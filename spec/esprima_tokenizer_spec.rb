require "jsduck/esprima_tokenizer"

describe JsDuck::EsprimaTokenizer do

  def tokenize(js)
    JsDuck::EsprimaTokenizer.instance.tokenize(js).map {|t| t[:type] }
  end

  describe "tokenize" do
    it "works with comment in the middle" do
      tokenize("foo = /** */ 3;").should == [
        :ident, :operator, :doc_comment, :number, :operator
      ]
    end

    it "works with comment at the beginning" do
      tokenize("/** */ var Foo;").should == [
        :doc_comment, :var, :ident, :operator
      ]
    end

    it "works with comment at the end" do
      tokenize("'use strict'; /** */").should == [
        :string, :operator, :doc_comment
      ]
    end

    it "works when only comment" do
      tokenize(" /** I am comment*/ ").should == [
        :doc_comment
      ]
    end

    it "works when just one token before comment" do
      tokenize(" ; /** I am comment*/ ").should == [
        :operator, :doc_comment
      ]
    end

    it "works when just one token after comment" do
      tokenize(" /** I am comment*/ z").should == [
        :doc_comment, :ident
      ]
    end

    it "augments :doc_comment token with line number" do
      tokens = JsDuck::EsprimaTokenizer.instance.tokenize("\n \n /**Com1*/ \n /**Com2\n*/ /**Com3*/")
      tokens[0][:linenr].should == 3
      tokens[1][:linenr].should == 4
      tokens[2][:linenr].should == 5
    end
  end

end

