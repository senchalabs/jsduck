require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  shared_examples_for "object with properties" do
    it "has name" do
      @obj[:name].should == @name
    end

    it "has type" do
      @obj[:type].should == "Object"
    end

    it "has doc" do
      @obj[:doc].should == "Geographical coordinates"
    end

    it "contains 2 properties" do
      @obj[:properties].length.should == 2
    end

    describe "first property" do
      before do
        @prop = @obj[:properties][0]
      end

      it "has name without namespace" do
        @prop[:name].should == "lat"
      end

      it "has type" do
        @prop[:type].should == "Object"
      end

      it "has doc" do
        @prop[:doc].should == "Latitude"
      end

      it "contains 2 subproperties" do
        @prop[:properties].length.should == 2
      end

      describe "first subproperty" do
        it "has name without namespace" do
          @prop[:properties][0][:name].should == "numerator"
        end
      end

      describe "second subproperty" do
        it "has name without namespace" do
          @prop[:properties][1][:name].should == "denominator"
        end
      end
    end

    describe "second property" do
      before do
        @prop = @obj[:properties][1]
      end

      it "has name without namespace" do
        @prop[:name].should == "lng"
      end

      it "has type" do
        @prop[:type].should == "Number"
      end

      it "has doc" do
        @prop[:doc].should == "Longitude"
      end
    end
  end

  describe "method parameter with properties" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {Object} coord Geographical coordinates
         * @param {Object} coord.lat Latitude
         * @param {Number} coord.lat.numerator Numerator part of a fraction
         * @param {Number} coord.lat.denominator Denominator part of a fraction
         * @param {Number} coord.lng Longitude
         */
        function foo(x, y) {}
      EOS
    end

    it "is interpreted as single parameter" do
      @doc[:params].length.should == 1
    end

    describe "single param" do
      before do
        @obj = @doc[:params][0]
        @name = "coord"
      end

      it_should_behave_like "object with properties"
    end
  end

  describe "event parameter with properties" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @event
         * Some event
         * @param {Object} coord Geographical coordinates
         * @param {Object} coord.lat Latitude
         * @param {Number} coord.lat.numerator Numerator part of a fraction
         * @param {Number} coord.lat.denominator Denominator part of a fraction
         * @param {Number} coord.lng Longitude
         */
        "foo"
      EOS
    end

    it "is interpreted as single parameter" do
      @doc[:params].length.should == 1
    end

    describe "single param" do
      before do
        @obj = @doc[:params][0]
        @name = "coord"
      end

      it_should_behave_like "object with properties"
    end
  end

  describe "cfg with properties" do
    before do
      @doc = parse(<<-EOS)
        /**
         * @cfg {Object} coord Geographical coordinates
         * @cfg {Object} coord.lat Latitude
         * @cfg {Number} coord.lat.numerator Numerator part of a fraction
         * @cfg {Number} coord.lat.denominator Denominator part of a fraction
         * @cfg {Number} coord.lng Longitude
         */
      EOS
    end

    it "is interpreted as single config" do
      @doc.length.should == 1
    end

    describe "the config" do
      before do
        @obj = @doc[0]
        @name = "coord"
      end

      it_should_behave_like "object with properties"
    end
  end

  describe "property with properties" do
    before do
      @doc = parse(<<-EOS)
        /**
         * @property {Object} coord Geographical coordinates
         * @property {Object} coord.lat Latitude
         * @property {Number} coord.lat.numerator Numerator part of a fraction
         * @property {Number} coord.lat.denominator Denominator part of a fraction
         * @property {Number} coord.lng Longitude
         */
      EOS
    end

    it "is interpreted as single property" do
      @doc.length.should == 1
    end

    describe "the property" do
      before do
        @obj = @doc[0]
        @name = "coord"
      end

      it_should_behave_like "object with properties"
    end
  end

  describe "method return value with properties" do
    before do
      @obj = parse(<<-EOS)[0][:return]
        /**
         * Some function
         * @return {Object} Geographical coordinates
         * @return {Object} return.lat Latitude
         * @return {Number} return.lat.numerator Numerator part of a fraction
         * @return {Number} return.lat.denominator Denominator part of a fraction
         * @return {Number} return.lng Longitude
         */
        function foo() {}
      EOS
      @name = "return"
    end

    it_should_behave_like "object with properties"
  end

  # Tests with buggy syntax

  describe "config option with properties in wrong order" do
    before do
      @obj = parse(<<-EOS)[0]
        /**
         * @cfg {Object} coord Geographical coordinates
         * @cfg {Number} coord.lat.numerator Numerator part of a fraction
         * @cfg {Number} coord.lat.denominator Denominator part of a fraction
         * @cfg {Object} coord.lat Latitude
         * @cfg {Number} coord.lng Longitude
         */
      EOS
      @name = "coord"
    end

    it_should_behave_like "object with properties"
  end

  describe "only namespaced config options" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} coord.lat Latitude
         * @cfg {Number} coord.lng Latitude
         */
      EOS
    end

    it "interpreted as just one config" do
      @doc[:name].should == "coord.lat"
    end
  end

  describe "normal config option name with dot after it" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} coord. Coordinate
         */
      EOS
    end

    it "has no dot in name" do
      @doc[:name].should == "coord"
    end

    it "has dot in doc" do
      @doc[:doc].should == ". Coordinate"
    end
  end

  describe "normal config option name with dot before it" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @cfg {Number} .coord Coordinate
         */
      EOS
    end

    it "has empty name" do
      @doc[:name].should == ""
    end

    it "has dot in doc" do
      @doc[:doc].should == ".coord Coordinate"
    end
  end

end
