require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "event" do
    it "creates event" do
      @doc[:tagname].should == :event
    end

    it "takes documentation from doc-comment" do
      @doc[:doc].should == "Fires when needed."
    end

    it "detects event name" do
      @doc[:name].should == "mousedown"
    end
  end

  describe "explicit event" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event mousedown
         * Fires when needed.
         */
      EOS
    end
    it_should_behave_like "event"
  end

  describe "event with @event after @params" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Fires when needed.
         * @param {String} x First parameter
         * @param {Number} y Second parameter
         * @event mousedown
         */
      EOS
    end
    it_should_behave_like "event"
  end

  describe "implicit event name as string" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event
         * Fires when needed.
         */
        "mousedown"
      EOS
    end
    it_should_behave_like "event"
  end

  describe "implicit event name as object property" do
    before do
      @doc = parse(<<-EOS)[0]
      ({/**
         * @event
         * Fires when needed.
         */
        mousedown: true })
      EOS
    end
    it_should_behave_like "event"
  end

  describe "implicit event name inside this.fireEvent()" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Fires when needed.
         */
        this.fireEvent("mousedown", foo, 7);
      EOS
    end
    it_should_behave_like "event"
  end

  describe "doc-comment followed by this.fireEvent without event name" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Fires when needed.
         */
        this.fireEvent(foo, 7);
      EOS
    end

    it "creates event" do
      @doc[:tagname].should == :event
    end

    it "leaves the name of event empty" do
      @doc[:name].should == ""
    end
  end

end
