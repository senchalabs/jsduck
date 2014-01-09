require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/class"
require "jsduck/relations"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string, "blah.js"))
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
      @method = @docs["Child"].find_members(:tagname => :method)[0]
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
      @method = @docs["Child"].find_members(:tagname => :method)[0]
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
      @docs["Child1"].find_members(:tagname => :method)[0]
      @docs["Child2"].find_members(:tagname => :method)[0]

      @method = @docs["Mixin"].find_members(:tagname => :method)[0]
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

    it "changes owner of bar method to target class" do
      methods["bar"][:owner].should == "Foo"
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

    it "keeps owner of foobar method to be the original class" do
      methods["foobar"][:owner].should == "Foo"
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

  describe "auto-detected override: in Ext.define" do
    let(:classes) do
      parse(<<-EOF)
        /** */
        Ext.define("Foo", {
            foobar: function(){}
        });

        /** */
        Ext.define("FooOverride", {
            override: "Foo",
            bar: function(){},
            foobar: function(){ return true; }
        });
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "adds member to overridden class" do
      methods["bar"].should_not == nil
    end

    it "adds note to docs about member being overridden" do
      methods["foobar"][:doc].should == "**Overridden in FooOverride.**"
    end
  end

  describe "use of @override tag without @class" do
    let(:classes) do
      parse(<<-EOF)
        /** */
        Ext.define("Foo", {
            foobar: function(){}
        });

        /** @override Foo */
        Ext.apply(Foo.prototype, {
            /** */
            bar: function(){ },
            /** */
            foobar: function(){ return true; }
        });
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "adds member to overridden class" do
      methods["bar"].should_not == nil
    end

    it "adds note to docs about member being overridden" do
      methods["foobar"][:doc].should == "**Overridden in blah.js.**"
    end
  end

  describe "override created with Ext.override" do
    let(:classes) do
      parse(<<-EOF)
        /** */
        Ext.define("Foo", {
            foobar: function(){}
        });

        /** */
        Ext.override(Foo, {
            bar: function(){ },
            foobar: function(){ return true; }
        });
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "adds member to overridden class" do
      methods["bar"].should_not == nil
    end

    it "adds note to docs about member being overridden" do
      methods["foobar"][:doc].should == "**Overridden in blah.js.**"
    end
  end

  describe "@override without classname" do
    let(:classes) do
      parse(<<-EOF)
        /** */
        Ext.define("Foo", {
            /** @override */
            foo: function() { }
        });
      EOF
    end

    let(:methods) { create_members_map(classes["Foo"]) }

    it "gets ignored" do
      methods["foo"].should_not == nil
    end
  end
end
