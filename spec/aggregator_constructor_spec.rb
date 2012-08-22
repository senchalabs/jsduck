require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  shared_examples_for "constructor" do
    it "has one method" do
      methods.length.should == 1
    end

    it "has method with name 'constructor'" do
      methods[0][:name].should == "constructor"
    end

    it "has method with needed parameters" do
      methods[0][:params].length.should == 1
    end
  end

  describe "class with @constructor" do
    let(:methods) do
      parse(<<-EOS)[0][:members]
        /**
         * @class MyClass
         * Comment here.
         * @constructor
         * This constructs the class
         * @param {Number} nr
         */
      EOS
    end

    it_should_behave_like "constructor"
  end

  describe "class with method named constructor" do
    let(:methods) do
      parse(<<-EOS)[0][:members]
        /**
         * Comment here.
         */
        MyClass = {
            /**
             * @method constructor
             * This constructs the class
             * @param {Number} nr
             */
        };
      EOS
    end

    it_should_behave_like "constructor"
  end

  describe "class with member containing @constructor" do
    let(:methods) do
      parse(<<-EOS)[0][:members]
        /**
         * Comment here.
         */
        MyClass = {
            /**
             * @constructor
             * This constructs the class
             * @param {Number} nr
             */
        };
      EOS
    end

    it_should_behave_like "constructor"
  end

  describe "class with both @constructor tag and constructor property inside Ext.define()" do
    let(:methods) do
      parse(<<-EOS)[0][:members]
        /**
         * Comment here.
         * @constructor
         * This constructs the class
         * @param {Number} nr
         */
        Ext.define("MyClass", {
            constructor: function() {
            }
        });
      EOS
    end

    it "detects just one constructor" do
      methods.length.should == 1
    end
  end

end
