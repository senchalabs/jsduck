require "jsduck/doc/scanner"
require "jsduck/doc/standard_tag_parser"

describe JsDuck::Doc::StandardTagParser do

  def parse(str, opts)
    scanner = JsDuck::Doc::Scanner.new
    scanner.input = StringScanner.new(str)
    std_parser = JsDuck::Doc::StandardTagParser.new(scanner)
    return std_parser.parse(opts)
  end

  it "Returns empty hash when no options specified" do
    parse("Whatever...", {}).should == {}
  end

  it "adds :tagname to returned data" do
    parse("Whatever...", {:tagname => "blah"}).should == {:tagname => "blah"}
  end

  it "parses :type" do
    parse("{Foo}", {:type => true}).should == {:type => "Foo"}
  end

  it "parses :type and :optional" do
    parse("{Foo=}", {:type => true, :optional => true}).should ==
      {:type => "Foo", :optional => true}
  end

  it "ignores optionality in :type when no :optional specified" do
    parse("{Foo=}", {:type => true}).should ==
      {:type => "Foo"}
  end

  it "parses :name" do
    parse("some_ident", {:name => true}).should == {:name => "some_ident"}
  end

  it "parses :name and :optional" do
    parse("[ident]", {:name => true, :optional => true}).should ==
      {:name => "ident", :optional => true}
  end

  it "fails to parse :name when name in brackets but no :optional specified" do
    parse("[ident]", {:name => true}).should == {}
  end

  it "parses :name, :default and :optional" do
    parse("[ident=10]", {:name => true, :default => true, :optional => true}).should ==
      {:name => "ident", :default => "10", :optional => true}
  end

  it "parses :name and :default without optionality" do
    parse("ident=10", {:name => true, :default => true}).should ==
      {:name => "ident", :default => "10"}
  end

  it "parses quoted :default value" do
    parse("ident = 'Hello, world!'", {:name => true, :default => true}).should ==
      {:name => "ident", :default => "'Hello, world!'"}
  end

  it "parses array :default value" do
    parse("ident = [1, 2, 3, 4]", {:name => true, :default => true}).should ==
      {:name => "ident", :default => "[1, 2, 3, 4]"}
  end

  it "ignores stuff after :default value" do
    parse("ident = 15.5 Blah", {:name => true, :default => true}).should ==
      {:name => "ident", :default => "15.5"}
  end

end
