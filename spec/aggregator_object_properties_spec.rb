require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "method parameter with properties" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @param {Object} coord Geographical coordinates
         * @param {Number} coord.lat Latitude
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
        @param = @doc[:params][0]
      end

      it "has name" do
        @param[:name].should == "coord"
      end

      it "has type" do
        @param[:type].should == "Object"
      end

      it "has doc" do
        @param[:doc].should == "Geographical coordinates"
      end

      it "contains 2 properties" do
        @param[:properties].length.should == 2
      end

      describe "first property" do
        before do
          @prop = @param[:properties][0]
        end

        it "has name without namespace" do
          @prop[:name].should == "lat"
        end

        it "has type" do
          @prop[:type].should == "Number"
        end

        it "has doc" do
          @prop[:doc].should == "Latitude"
        end
      end

      describe "second property" do
        before do
          @prop = @param[:properties][1]
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
  end

end
