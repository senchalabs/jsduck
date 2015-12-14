require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string, {:inherit_doc => true})
  end

  shared_examples_for "basic docs inheritance" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Foo
         */
            /**
             * @method foo
             * Comment for class Foo.
             */
        /**
         * @class Bar
         */
            /**
             * @method bar
             * #{@tag_name} Foo#foo
             */
      EOF
      @bar = @docs["Bar"][:members][0]
    end

    it "inherits docs from the referenced member" do
      @bar[:doc].should == "Comment for class Foo."
    end
  end

  describe "@inheritdoc" do
    before { @tag_name = "@inheritdoc" }

    it_behaves_like "basic docs inheritance"
  end

  describe "@inheritDoc" do
    before { @tag_name = "@inheritDoc" }

    it_behaves_like "basic docs inheritance"
  end

  describe "@alias" do
    before { @tag_name = "@alias" }

    it_behaves_like "basic docs inheritance"
  end

end
