require "rkelly"
require "jsduck/js/rkelly_adapter"

describe JsDuck::Js::RKellyAdapter do
  def adapt(string)
    rkelly_ast = RKelly::Parser.new.parse(string)
    ast = JsDuck::Js::RKellyAdapter.new.adapt(rkelly_ast)
    return ast["body"][0]
  end

  def adapt_value(string)
    adapt(string)["expression"]["value"]
  end

  describe "values of numbers" do
    it "decimal" do
      adapt_value("5").should == 5
    end

    it "octal" do
      adapt_value("015").should == 8 + 5
    end

    it "hex" do
      adapt_value("0x1F").should == 16 + 15
    end

    it "float" do
      adapt_value("3.14").should == 3.14
    end

    it "float beginning with comma" do
      adapt_value(".15").should == 0.15
    end

    it "float with E" do
      adapt_value("2e12").should == 2000000000000
    end
  end

  describe "values of strings" do
    it "single-quoted" do
      adapt_value("'foo'").should == 'foo'
    end

    it "double-quoted" do
      adapt_value('"bar"').should == "bar"
    end

    it "with special chars" do
      adapt_value('"\n \t \r"').should == "\n \t \r"
    end

    it "with escaped quotes" do
      adapt_value('" \" "').should == ' " '
    end

    it "with latin1 octal escape" do
      adapt_value('"\101 \251"').should == "A \251"
    end

    it "with latin1 hex escape" do
      adapt_value('"\x41 \xA9"').should == "A \xA9"
    end

    it "with unicode escape" do
      adapt_value('"\u00A9"').should == [0x00A9].pack("U")
    end

    it "with Ruby-like variable interpolation" do
      adapt_value('"#{foo}"').should == '#{foo}'
    end
  end

  describe "values of regexes" do
    it "are left as is" do
      adapt_value('/blah.*/').should == '/blah.*/'
    end
  end

  describe "values of boolens" do
    it "true" do
      adapt_value('true').should == true
    end
    it "false" do
      adapt_value('false').should == false
    end
  end

  describe "value of null" do
    it "is nil" do
      adapt_value('null').should == nil
    end
  end

  describe "string properties" do
    it "don't use Ruby's eval()" do
      adapt('({"foo#$%": 5})')["expression"]["properties"][0]["key"]["value"].should == 'foo#$%'
    end
  end

end
