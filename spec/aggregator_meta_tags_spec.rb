require "jsduck/aggregator"
require "jsduck/source_file"
require "jsduck/meta_tag"

describe JsDuck::Aggregator do

  class AuthorTag < JsDuck::MetaTag
    def initialize
      @name = "author"
    end
  end

  class EmailTag < JsDuck::MetaTag
    def initialize
      @name = "email"
    end
  end

  class LongTag < JsDuck::MetaTag
    def initialize
      @name = "long"
      @multiline = true
    end
  end

  def parse(string)
    agr = JsDuck::Aggregator.new
    meta_tags = [AuthorTag.new, EmailTag.new, LongTag.new]
    agr.aggregate(JsDuck::SourceFile.new(string, "", {:meta_tags => meta_tags}))
    agr.result
  end

  describe "class with meta-tags" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @author John Doe
         * @author Steve Jobs
         * @email Kill Bill
         * Comment here.
         */
      EOS
    end

    it "detects content of the defined tags" do
      @doc[:meta].should == {
        "author" => ["John Doe", "Steve Jobs"],
        "email" => ["Kill Bill"],
      }
    end
  end

  describe "class with multiline meta-tag" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * Class docs.
         * @long Some text
         * on multiple
         * lines.
         * @author Steve Jobs
         */
      EOS
    end

    it "detects tag content until next @tag" do
      @doc[:meta].should == {
        "long" => ["Some text\non multiple\nlines."],
        "author" => ["Steve Jobs"],
      }
    end
  end

  describe "meta-tag content containing {@link}" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class MyClass
         * @long Me {@link foo bar}
         * @author Me {@link foo bar}
         */
      EOS
    end

    it "includes {@link} as part of tag content" do
      @doc[:meta].should == {
        "long" => ["Me {@link foo bar}"],
        "author" => ["Me {@link foo bar}"],
      }
    end
  end
end
