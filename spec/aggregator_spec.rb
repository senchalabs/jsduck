require 'jsduck/lexer'
require 'jsduck/parser'
require 'jsduck/doc_parser'
require 'jsduck/merger'
require "jsduck/aggregator"

describe JsDuck::Aggregator, "@member" do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.parse(string)
    agr.result
  end

  it "defines the class where item belongs" do
    items = parse("
/**
 * @cfg foo
 * @member Bar
 */
")
    items[0][:member].should == "Bar"
  end

  it "forces item to be moved into that class" do
    items = parse("
/**
 * @class Bar
 */
/**
 * @class Baz
 */
/**
 * @cfg foo
 * @member Bar
 */
")
    items[0][:cfg].length.should == 1
    items[1][:cfg].length.should == 0
  end

  it "even when @member comes before the class itself" do
    items = parse("
/**
 * @cfg foo
 * @member Bar
 */
/**
 * @class Bar
 */
")
    items[0][:cfg].length.should == 1
  end

end
