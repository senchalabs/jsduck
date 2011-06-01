require "jsduck/source_writer"

describe JsDuck::SourceWriter do

  before do
    @formatter = JsDuck::SourceWriter.new("some/dir")
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
