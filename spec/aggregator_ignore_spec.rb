require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/process/ignored_classes"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.classify_orphans
    agr.create_global_class
    JsDuck::Process::IgnoredClasses.new(agr.classes).process_all!
    agr.classes
  end

  describe "@ignore in member" do
    before do
      @docs = parse(<<-EOSTR)["Foo"]
      /**
       * @class Foo
       */
          /**
           * @method bar
           * @ignore
           */
      EOSTR
    end

    it "ignores the member completely" do
      @docs[:members].length.should == 0
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
      @doc = parse(<<-EOSTR)["Foo"]
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

end
