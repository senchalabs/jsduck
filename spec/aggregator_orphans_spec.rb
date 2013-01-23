require "mini_parser"

describe JsDuck::Aggregator do

  def parse(string)
    Helper::MiniParser.parse(string)
  end

  shared_examples_for "class of orphans" do
    it "results in one class" do
      @classes.length.should == 1
    end

    it "combines members into itself" do
      @classes[@classname][:members].length.should == 2
    end

    it "preserves the order of members" do
      ms = @classes[@classname][:members]
      ms[0][:name].should == "foo"
      ms[1][:name].should == "bar"
    end
  end

  describe "class named by orphan members" do
    before do
      @classname = "MyClass"
      @classes = parse(<<-EOS)
        /**
         * @method foo
         * @member MyClass
         */
        /**
         * @method bar
         * @member MyClass
         */
      EOS
    end

    it_should_behave_like "class of orphans"
  end

  describe "orphan members without @member" do
    before do
      @classname = "global"
      @classes = parse(<<-EOS)
        /**
         * @method foo
         */
        /**
         * @method bar
         */
      EOS
    end

    it "results in global class" do
      @classes["global"][:name].should == "global"
    end

    it_should_behave_like "class of orphans"
  end
end
