require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.populate_aliases
    agr.result
  end

  describe "@alias in doc-comment" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
           */

        /** @class Core */
          /**
           * @method foobar
           * Alias comment.
           * @alias Foo#bar
           */
      EOF
      @orig = @docs[0][:members][:method][0]
      @alias = @docs[1][:members][:method][0]
    end

    it "original method keeps its name" do
      @orig[:name].should == "bar"
    end

    describe "alias" do
      it "keeps its name" do
        @alias[:name].should == "foobar"
      end

      it "inherits parameters" do
        @alias[:params].length.should == 2
      end

      it "inherits return value" do
        @alias[:return][:type].should == "String"
      end

      it "merges comment from original and its own comment" do
        @alias[:doc].should == "Alias comment.\n\nOriginal comment."
      end
    end
  end

end

