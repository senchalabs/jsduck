require "jsduck/source_formatter"

describe JsDuck::SourceFormatter do

  before do
    @formatter = JsDuck::SourceFormatter.new("some/dir")
  end

  describe "#format_pre" do

    it "adds line numbers" do
      out = @formatter.format_pre("foo\nbar\nbaz")
      out.should =~ /line-1.*foo/
      out.should =~ /line-2.*bar/
      out.should =~ /line-3.*baz/
    end

    it "line is closed inside <span>" do
      out = @formatter.format_pre("blah")
      out.should =~ /<span id='line-1'>blah<\/span>/
    end

    it "escapes HTML" do
      out = @formatter.format_pre("foo <br> bar &")
      out.should =~ /foo &lt;br&gt; bar &amp;/
    end

  end

  describe "#html_filename" do

    it "Returns filename with .html extension in output directory" do
      @formatter.html_filename("foo.js").should == "some/dir/foo.html"
    end

    it "Adds number to filename if provided" do
      @formatter.html_filename("foo.js", 2).should == "some/dir/foo2.html"
    end

  end
end
