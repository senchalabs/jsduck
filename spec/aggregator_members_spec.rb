require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "@member defines the class of member" do

    it "when inside a lonely doc-comment" do
      items = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
      EOS
      items[0][:owner].should == "Bar"
    end

    it "when used after the corresponding @class" do
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
      items[0][:members][:cfg].length.should == 1
      items[1][:members][:cfg].length.should == 0
    end

    it "when used before the corresponding @class" do
      items = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
        /**
         * @class Bar
         */
      EOS
      items[0][:members][:cfg].length.should == 1
    end
  end

end
