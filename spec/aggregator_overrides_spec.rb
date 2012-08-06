require "jsduck/aggregator"
require "jsduck/source_file"
require "jsduck/class"
require "jsduck/relations"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.process_overrides
    JsDuck::Relations.new(agr.result.map {|cls| JsDuck::Class.new(cls) })
  end

  shared_examples_for "override" do
    it "gets :override property" do
      @method.should have_key(:overrides)
    end

    it "lists parent method in :override property" do
      @method[:overrides][0][:owner].should == "Parent"
    end
  end

  describe "method overriding parent class method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Parent */
          /** @method foo */

        /** @class Child @extends Parent */
          /** @method foo */
      EOF
      @method = @docs["Child"].members(:method)[0]
    end

    it_should_behave_like "override"
  end

  describe "mixin method overriding parent class method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Parent */
          /** @method foo */
        /** @class Mixin */
          /** @method foo */

        /** @class Child @extends Parent @mixins Mixin */
      EOF
      @method = @docs["Child"].members(:method)[0]
    end

    it_should_behave_like "override"
  end

  describe "mixin method overriding multiple parent class methods" do
    before do
      @docs = parse(<<-EOF)
        /** @class Parent1 */
          /** @method foo */
        /** @class Parent2 */
          /** @method foo */
        /** @class Mixin */
          /** @method foo */

        /** @class Child1 @extends Parent1 @mixins Mixin */
        /** @class Child2 @extends Parent2 @mixins Mixin */
      EOF
      # Call #members on two child classes, this will init the
      # :overrides in Mixin class
      @docs["Child1"].members(:method)
      @docs["Child2"].members(:method)

      @method = @docs["Mixin"].members(:method)[0]
    end

    it "gets :override property listing multiple methods" do
      @method[:overrides].length.should == 2
    end
  end

  def create_members_map(cls)
    r = {}
    cls.all_local_members.each do |m|
      r[m[:name]] = m
    end
    r
  end

  describe "defining @override for a class" do
    let(:classes) do
      parse(<<-EOF)
        /**
         * @class Foo
         * Foo comment.
         */
          /**
           * @method foo
           * Foo comment.
           */
          /**
           * @method foobar
           * Original comment.
           */

        /**
         * @class FooOverride
         * @override Foo
         * FooOverride comment.
         */
          /**
           * @method bar
           * Bar comment.
           */
          /**
           * @method foobar
           * Override comment.
           */
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "keeps the original class" do
      classes["Foo"].should_not == nil
    end

    it "throws away the override" do
      classes["FooOverride"].should == nil
    end

    it "combines class doc with doc from override" do
      classes["Foo"][:doc].should == "Foo comment.\n\n**From override FooOverride:** FooOverride comment."
    end

    it "adds override to list of source files" do
      classes["Foo"][:files].length.should == 2
    end

    it "keeps its original foo method" do
      methods["foo"].should_not == nil
    end

    it "gets the new bar method from override" do
      methods["bar"].should_not == nil
    end

    it "adds special override comment to bar method" do
      methods["bar"][:doc].should == "Bar comment.\n\n**Defined in override FooOverride.**"
    end

    it "keeps the foobar method that's in both original and override" do
      methods["foobar"].should_not == nil
    end

    it "combines docs of original and override" do
      methods["foobar"][:doc].should == "Original comment.\n\n**From override FooOverride:** Override comment."
    end

    it "adds override source to list of files to overridden member" do
      methods["foobar"][:files].length.should == 2
    end
  end

  describe "comment-less @override for a class" do
    let(:classes) do
      parse(<<-EOF)
        /**
         * @class Foo
         * Foo comment.
         */
          /**
           * @method foobar
           * Original comment.
           */

        /**
         * @class FooOverride
         * @override Foo
         */
          /**
           * @method foobar
           */
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "adds no doc from override to the class itself" do
      classes["Foo"][:doc].should == "Foo comment."
    end

    it "adds note about override to member" do
      methods["foobar"][:doc].should == "Original comment.\n\n**Overridden in FooOverride.**"
    end
  end
end

