require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "@static on single method" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @static
         */
        function bar() {}
      EOS
    end

    it "labels that method as static" do
      @doc[:static].should == true
    end
  end

  describe "@static in class context" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class Foo
         */
        /**
         * Some function
         * @static
         */
        function bar() {}
        /**
         * Some property
         * @static
         */
        baz = "haha"
      EOS
    end

    it "adds method to statics" do
      @doc[:statics][:method][0][:name].should == "bar"
    end

    it "adds property to statics" do
      @doc[:statics][:property][0][:name].should == "baz"
    end
  end

end
