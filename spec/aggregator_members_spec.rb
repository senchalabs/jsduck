require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
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
      items[0][:members].length.should == 1
      items[1][:members].length.should == 0
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
      items[0][:members].length.should == 1
    end
  end

  def parse_to_classes(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.classify_orphans
    agr.result
  end

  it "creates classes for all orphans with @member defined" do
    classes = parse_to_classes(<<-EOS)
      /**
       * @cfg foo
       * @member FooCls
       */
      /**
       * @cfg bar
       * @member BarCls
       */
    EOS

    classes[0][:name].should == "FooCls"
    classes[1][:name].should == "BarCls"
  end

end
