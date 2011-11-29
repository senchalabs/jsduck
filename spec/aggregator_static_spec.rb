require "jsduck/aggregator"
require "jsduck/source_file"
require "jsduck/meta_tag_loader"

describe JsDuck::Aggregator do
  before(:all) do
    @opts = {:meta_tags => JsDuck::MetaTagLoader.new.meta_tags}
  end

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string, "", @opts))
    agr.result
  end

  describe "normal @static on single method" do
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
      @doc[:meta][:static].should == true
    end

    it "doesn't detect inheritable property" do
      @doc[:inheritable].should_not == true
    end
  end

  describe "@static with @inheritable" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @static
         * @inheritable
         */
        function bar() {}
      EOS
    end

    it "labels that method as static" do
      @doc[:meta][:static].should == true
    end

    it "detects the @inheritable property" do
      @doc[:inheritable].should == true
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
