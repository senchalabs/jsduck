require "jsduck/doc_parser"

describe JsDuck::DocParser do

  def parse_single(doc)
    return JsDuck::DocParser.new.parse(doc)
  end

  describe "simple method doc-comment" do
    before do
      @doc = parse_single(<<-EOS.strip)
        /**
         * @method foo
         * Some docs.
         * @param {Number} x doc for x
         * @return {String} resulting value
         */
      EOS
    end

    it "produces 3 @tags" do
      @doc.length.should == 3
    end

    describe "@method" do
      before do
        @tag = @doc[0]
      end
      it "detects tagname" do
        @tag[:tagname].should == :method
      end
      it "detects name" do
        @tag[:name].should == "foo"
      end
      it "detects doc" do
        @tag[:doc].should == "Some docs."
      end
    end

    describe "@param" do
      before do
        @tag = @doc[1]
      end
      it "detects tagname" do
        @tag[:tagname].should == :param
      end
      it "detects name" do
        @tag[:name].should == "x"
      end
      it "detects type" do
        @tag[:type].should == "Number"
      end
      it "detects doc" do
        @tag[:doc].should == "doc for x"
      end
    end

    describe "@return" do
      before do
        @tag = @doc[2]
      end
      it "detects tagname" do
        @tag[:tagname].should == :return
      end
      it "detects type" do
        @tag[:type].should == "String"
      end
      it "detects doc" do
        @tag[:doc].should == "resulting value"
      end
    end
  end

  describe "@type without curlies" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
        /**
         * @type Boolean|String
         */
      EOS
    end
    it "detects tagname" do
      @tag[:tagname].should == :type
    end
    it "detects tagname" do
      @tag[:type].should == "Boolean|String"
    end
  end

  describe "single-line doc-comment" do
    before do
      @tag = parse_single("/** @event blah */")[0]
    end
    it "detects tagname" do
      @tag[:tagname].should == :event
    end
    it "detects name" do
      @tag[:name].should == "blah"
    end
  end

end

