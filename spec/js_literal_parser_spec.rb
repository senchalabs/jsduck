require "jsduck/js_literal_parser"

describe JsDuck::JsLiteralParser do

  def parse(source)
    JsDuck::JsLiteralParser.new(source).literal
  end

  it "parses number" do
    r = parse("5")
    r[:type].should == :number
    r[:value].should == "5"
  end

  it "parses string" do
    r = parse("'foo'")
    r[:type].should == :string
    r[:value].should == "foo"
  end

  it "parses regex" do
    r = parse("/[a-z]/i")
    r[:type].should == :regex
    r[:value].should == "/[a-z]/i"
  end

  it "parses array" do
    r = parse("[1, 2]")
    r[:type].should == :array
    v = r[:value]
    v.length.should == 2
    v[0][:value].should == "1"
    v[1][:value].should == "2"
  end

  it "parses object" do
    r = parse("{foo: 1, bar: [2, 3]}")
    r[:type].should == :object
    v = r[:value]
    v.length.should == 2
    v[0][:key][:type].should == :ident
    v[0][:key][:value].should == "foo"
    v[0][:value][:type].should == :number
    v[0][:value][:value].should == "1"
  end

end

