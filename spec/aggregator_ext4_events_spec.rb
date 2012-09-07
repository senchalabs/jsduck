require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.append_ext4_event_options if agr.ext4?
    agr.result
  end

  describe "event inside Ext.define get extra parameter" do
    let(:event) do
      parse(<<-EOF)[0][:members][0]
        /** */
        Ext.define("Blah", {
            /**
             * @event click
             * @param {Number} foo
             * @param {String} bar
             */
        });
      EOF
    end

    it "added to end" do
      event[:params].length.should == 3
    end

    it "named eOpts" do
      event[:params][2][:name].should == "eOpts"
    end

    it "of type Object" do
      event[:params][2][:type].should == "Object"
    end

    it "with standard description" do
      event[:params][2][:doc].should =~ /The options object passed to.*addListener/
    end
  end

  describe "When some class defined with Ext.define" do
    let(:events) do
      parse(<<-EOF)[0][:members]
        /** @class Foo */
            /**
             * @event click
             * @param {Number} foo
             */
            /**
             * @event touch
             */

        /** */
        Ext.define("Bar", {});
      EOF
    end

    it "events get extra parameter" do
      events[0][:params].length.should == 2
      events[1][:params].length.should == 1
    end
  end

  describe "Without Ext.define-d class" do
    let(:events) do
      parse(<<-EOF)[0][:members]
        /** @class Foo */
            /**
             * @event click
             * @param {Number} foo
             */
            /**
             * @event touch
             */
      EOF
    end

    it "no extra param gets added" do
      events[0][:params].length.should == 1
      events[1][:params].length.should == 0
    end
  end

end

