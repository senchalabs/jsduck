require "jsduck/aggregator"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.parse(string)
    agr.result
  end

  describe "one class many times" do
    before do
      @classes = parse(<<-EOS)
        /**
         * @class Foo
         * @cfg c1
         */
          /** @method fun1 */
          /** @event eve1 */
          /** @property prop1 */
        /**
         * @class Foo
         * @extends Bar
         * Second description.
         * @xtype xfoo
         * @private
         * @cfg c2
         */
          /** @method fun2 */
          /** @event eve3 */
          /** @property prop2 */
        /**
         * @class Foo
         * @extends Bazaar
         * @singleton
         * Third description.
         * @xtype xxxfoo
         * @cfg c3
         */
          /** @method fun3 */
          /** @event eve3 */
          /** @property prop3 */
      EOS
    end

    it "results in only one class" do
      @classes.length.should == 1
    end

    it "takes class doc from first doc-block that has one" do
      @classes[0][:doc].should == "Second description."
    end

    it "takes @extends from first doc-block that has one" do
      @classes[0][:extends].should == "Bar"
    end

    it "takes @xtype from first doc-block that has one" do
      @classes[0][:xtype].should == "xfoo"
    end

    it "is singleton when one doc-block is singleton" do
      @classes[0][:singleton].should == true
    end

    it "is private when one doc-block is private" do
      @classes[0][:private].should == true
    end

    it "combines all configs" do
      @classes[0][:cfg].length.should == 3
    end

    it "combines all methods, events, properties" do
      @classes[0][:method].length.should == 3
      @classes[0][:event].length.should == 3
      @classes[0][:property].length.should == 3
    end
  end

end
