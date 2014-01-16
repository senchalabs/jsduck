require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/meta_tag"
require "jsduck/meta_tag_registry"

describe JsDuck::Aggregator do

  class AuthorTag < JsDuck::MetaTag
    def initialize
      @name = "author"
      @key = :author
    end
  end

  class EmailTag < JsDuck::MetaTag
    def initialize
      @name = "email"
      @key = :email
    end
  end

  class LongTag < JsDuck::MetaTag
    def initialize
      @name = "long"
      @key = :long
      @multiline = true
    end
  end

  # Replace the global MetaTagRegistry instance with a custom one for
  # these tests. Afterwards set it back as it was before.
  before(:all) do
    @old_mtr = JsDuck::MetaTagRegistry.instance
    reg = JsDuck::MetaTagRegistry.new
    reg.register([AuthorTag.new, EmailTag.new, LongTag.new])
    JsDuck::MetaTagRegistry.instance = reg
  end

  after(:all) do
    JsDuck::MetaTagRegistry.instance = @old_mtr
  end


  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
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
        :author => ["John Doe", "Steve Jobs"],
        :email => ["Kill Bill"],
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
        :long => ["Some text\non multiple\nlines."],
        :author => ["Steve Jobs"],
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
        :long => ["Me {@link foo bar}"],
        :author => ["Me {@link foo bar}"],
      }
    end
  end

  describe "meta-tag inside class member" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @method foo
         * Some description.
         * @author John Doe
         */
      EOS
    end

    it "detects the meta tag" do
      @doc[:meta].should == {
        :author => ["John Doe"],
      }
    end

    it "leaves member description as is" do
      @doc[:doc].should == "Some description."
    end
  end
end
