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

  def parse(string)
    agr = JsDuck::Aggregator.new
    meta_tags = [AuthorTag.new, EmailTag.new]
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
      @doc[:meta].should == [
        {:name => "author", :content => "John Doe"},
        {:name => "author", :content => "Steve Jobs"},
        {:name => "email", :content => "Kill Bill"},
      ]
    end
  end

end
