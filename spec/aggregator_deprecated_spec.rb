require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "@deprecated" do

    before do
      @items = parse(<<-EOS)
        /**
         * @cfg escapeRe
         * @deprecated 4.0 Use escapeRegex instead.
         */
      EOS
    end

    it "detects deprecation description" do
      @items[0][:deprecated][:text].should == "Use escapeRegex instead."
    end

    it "detects version of deprecation" do
      @items[0][:deprecated][:version].should == "4.0"
    end
  end

  describe "@deprecated without version number" do

    before do
      @items = parse(<<-EOS)
        /**
         * @cfg escapeRe
         * @deprecated Use escapeRegex instead.
         */
      EOS
    end

    it "doesn't detect version number" do
      @items[0][:deprecated][:version].should == nil
    end

    it "still detects description" do
      @items[0][:deprecated][:text].should == "Use escapeRegex instead."
    end
  end

end
