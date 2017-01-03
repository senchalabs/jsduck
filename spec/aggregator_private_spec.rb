require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.remove_ignored_classes
    agr.result
  end

  describe "@private" do
    before do
      @doc = parse("/** @private */")[0]
    end

    it "marks item as private" do
      @doc[:private].should == true
    end

    it "adds private meta tag" do
      @doc[:meta][:private].should == true
    end
  end

  describe "@ignore in member" do
    before do
      @docs = parse("/** @ignore */")
    end

    it "ignores the member completely" do
      @docs.length.should == 0
    end
  end

  describe "@ignore in class" do
    before do
      @docs = parse(<<-EOSTR)
      /**
       * @class Foo
       * @ignore
       */
          /**
           * @method bar
           */
          /**
           * @method baz
           */
      EOSTR
    end

    it "ignores the class and all it's members" do
      @docs.length.should == 0
    end
  end

  describe "@ignore in duplicate member" do
    before do
      @doc = parse(<<-EOSTR)[0]
      /**
       * @class Foo
       */
          /**
           * @method bar
           * First method docs
           */
          /**
           * @method bar
           * Second method docs
           * @ignore
           */
      EOSTR
    end

    it "ignores one member" do
      @doc[:members].length.should == 1
    end

    it "lets the other member stay" do
      @doc[:members][0][:doc].should == "First method docs"
    end
  end

  describe "@hide" do
    before do
      @doc = parse("/** @hide */")[0]
    end

    it "does not mark item as private" do
      @doc[:private].should_not == true
    end

    it "marks item as :hide" do
      @doc[:meta][:hide].should == true
    end
  end

  describe "@hide" do
    before do
      @doc = parse("/** @hide */")[0]
    end

    it "does not mark item as private" do
      @doc[:private].should_not == true
    end

    it "marks item as :hide" do
      @doc[:meta][:hide].should == true
    end
  end

end
