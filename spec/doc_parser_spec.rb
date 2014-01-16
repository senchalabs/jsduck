require "jsduck/doc_parser"

describe JsDuck::DocParser do

  def parse_single(doc)
    return JsDuck::DocParser.new.parse(doc)
  end

  describe "simple method doc-comment" do
    before do
      @doc = parse_single(<<-EOS.strip)
         * @method foo
         * Some docs.
         * @param {Number} x doc for x
         * @return {String} resulting value
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
         * @type Boolean|String
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
      @tag = parse_single("@event blah")[0]
    end
    it "detects tagname" do
      @tag[:tagname].should == :event
    end
    it "detects name" do
      @tag[:name].should == "blah"
    end
  end

  describe "doc-comment without *-s on left side" do
    before do
      @tag = parse_single("
        @event blah
        Some comment.
        More text.

            code sample
        ")[0]
    end
    it "detects the @event tag" do
      @tag[:tagname].should == :event
    end
    it "trims whitespace at beginning of lines up to first line" do
      @tag[:doc].should == "Some comment.\nMore text.\n\n    code sample"
    end
  end

  describe "type definition with nested {braces}" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * @param {{foo:{bar:Number}}} x
      EOS
    end
    it "is parsed ensuring balanced braces" do
      @tag[:type].should == "{foo:{bar:Number}}"
    end
  end

  describe "e-mail address containing a valid @tag" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * john@method.com
      EOS
    end
    it "is treated as plain text" do
      @tag[:doc].should == "john@method.com"
    end
  end

  describe "{@inline} tag" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * {@inline Some#method}
      EOS
    end
    it "is treated as plain text, to be processed later" do
      @tag[:doc].should == "{@inline Some#method}"
    end
  end

  describe "@example tag" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * Code:
         *
         *     @example blah
      EOS
    end
    it "is treated as plain text, to be processed later" do
      @tag[:doc].should == "Code:\n\n    @example blah"
    end
  end

  describe "@tag indented by 4+ spaces" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * Code example:
         *
         *     @method
      EOS
    end
    it "is treated as plain text within code example" do
      @tag[:doc].should == "Code example:\n\n    @method"
    end
  end

  describe "@tag indented by 4+ spaces and preceded by additional code" do
    before do
      @tag = parse_single(<<-EOS.strip)[0]
         * Code example:
         *
         *     if @method then
      EOS
    end
    it "is treated as plain text within code example" do
      @tag[:doc].should == "Code example:\n\n    if @method then"
    end
  end

  describe "@tag simply separated by 4+ spaces" do
    before do
      @tag = parse_single(<<-EOS.strip)[1]
         * Foo:    @method
      EOS
    end
    it "is parsed as normal tag" do
      @tag[:tagname].should == :method
    end
  end

  describe "indented code on previous line" do
    before do
      @params = parse_single(<<-EOS.strip).find_all {|t| t[:tagname] == :param }
         * @param x
         *     Foo
         *     Bar
         * @param y
      EOS
    end
    it "doesn't cause the tag to be skipped" do
      @params.length.should == 2
    end
  end

end
