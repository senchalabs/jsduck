require "mini_parser"

describe JsDuck::Aggregator do

  def parse(string)
    Helper::MiniParser.parse(string)
  end

  describe "@member defines the class of member" do

    it "when inside a lonely doc-comment" do
      classes = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
      EOS
      classes["Bar"][:members][0][:owner].should == "Bar"
    end

    it "when used after the corresponding @class" do
      classes = parse(<<-EOS)
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
      classes["Bar"][:members].length.should == 1
      classes["Baz"][:members].length.should == 0
    end

    it "when used before the corresponding @class" do
      classes = parse(<<-EOS)
        /**
         * @cfg foo
         * @member Bar
         */
        /**
         * @class Bar
         */
      EOS
      classes["Bar"][:members].length.should == 1
    end
  end

end
