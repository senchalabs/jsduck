require "jsduck/aggregator"
require "jsduck/parser"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Parser.new(string).parse)
    agr.result
  end

  describe "@member" do

    it "defines the class where item belongs" do
      items = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
      EOS
      items[0][:member].should == "Bar"
    end

    it "forces item to be moved into that class" do
      items = parse(<<-EOS)
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
      EOS
      items[0][:cfg].length.should == 1
      items[1][:cfg].length.should == 0
    end

    it "even when @member comes before the class itself" do
      items = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
        /**
         * @class Bar
         */
      EOS
      items[0][:cfg].length.should == 1
    end
  end

end
