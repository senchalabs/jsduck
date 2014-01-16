# -*- coding: utf-8 -*-
require "jsduck/shortener"

describe JsDuck::Shortener do

  describe "#shorten" do

    def shorten(text)
      JsDuck::Shortener.shorten(text)
    end

    before do
      JsDuck::Shortener.instance.max_length = 10
    end

    it "appends ellipsis to short text" do
      shorten("Ha ha").should == "Ha ha ..."
    end

    it "shortens text longer than max length" do
      shorten("12345678901").should == "1234567..."
    end

    it "counts multi-byte characters correctly when measuring text length" do
      # Text ending with a-umlaut character
      shorten("123456789ä").should == "123456789ä ..."
    end

    it "shortens text with multi-byte characters correctly" do
      # Text containing a-umlaut character
      shorten("123456ä8901").should == "123456ä..."
    end

    it "strips HTML tags when shortening" do
      shorten("<a href='some-long-link'>12345678901</a>").should == "1234567..."
    end

    it "takes only first centence" do
      shorten("bla. blah").should == "bla. ..."
    end
  end

  describe "#too_long?" do

    def too_long?(text)
      JsDuck::Shortener.too_long?(text)
    end

    before do
      JsDuck::Shortener.instance.max_length = 10
    end

    it "is false when exactly equal to the max_length" do
      too_long?("1234567890").should == false
    end

    it "is false when short sentence" do
      too_long?("bla bla.").should == false
    end

    it "is true when long sentence" do
      too_long?("bla bla bla.").should == true
    end

    it "ignores HTML tags when calculating text length" do
      too_long?("<a href='some-long-link'>Foo</a>").should == false
    end

    it "counts multi-byte characters correctly" do
      # Text ending with a-umlaut character
      too_long?("123456789ä").should == false
    end
  end


  describe "#first_sentence" do
    def first_sentence(text)
      JsDuck::Shortener.first_sentence(text)
    end

    it "extracts first sentence" do
      first_sentence("Hi John. This is me.").should == "Hi John."
    end
    it "extracts first sentence of multiline text" do
      first_sentence("Hi\nJohn.\nThis\nis\nme.").should == "Hi\nJohn."
    end
    it "returns everything if no dots in text" do
      first_sentence("Hi John this is me").should == "Hi John this is me"
    end
    it "returns everything if no dots in text" do
      first_sentence("Hi John this is me").should == "Hi John this is me"
    end
    it "ignores dots inside words" do
      first_sentence("Hi John th.is is me").should == "Hi John th.is is me"
    end
    it "ignores first empty sentence" do
      first_sentence(". Hi John. This is me.").should == ". Hi John."
    end
    it "understands chinese/japanese full-stop character as end of sentence" do
      first_sentence("Some Chinese Text。 And some more。").should == "Some Chinese Text。"
    end
  end

end
