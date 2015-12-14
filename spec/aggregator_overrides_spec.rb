require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string, {
        :overrides => true,
        :inherit_doc => true,
        :filename => "blah.js"
      })
  end

  shared_examples_for "override" do
    it "gets :override property" do
      @method.should have_key(:overrides)
    end

    it "lists parent method in :override property" do
      @method[:overrides][0][:owner].should == "Parent"
    end

    it "lists name of the method in :override property" do
      @method[:overrides][0][:name].should == "foo"
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

  # Test for bug #465
  describe "overriding with multiple auto-detected members" do
    before do
      @docs = parse(<<-EOF)
          /** */
          Ext.define('Base', {
              /** */
              foo: 1
          });

          /** */
          Ext.define('Child', {
              extend: 'Base',

              foo: 2
          });

          /** */
          Ext.define('GrandChild', {
              extend: 'Child',

              foo: 3
          });

          /** */
          Ext.define('GrandGrandChild', {
              extend: 'GrandChild',

              foo: 4
          });
      EOF
    end

    def get_overrides(cls)
      @docs[cls].find_members(:name => "foo")[0][:overrides]
    end


    it "lists just one override in Child class" do
      get_overrides("Child").length.should == 1
    end

    it "lists just one override in GrandChild class" do
      get_overrides("GrandChild").length.should == 1
    end

    it "lists just one override in GrandGrandChild class" do
      get_overrides("GrandGrandChild").length.should == 1
    end


    it "lists Base as overridden in Child class" do
      get_overrides("Child")[0][:owner].should == "Base"
    end

    it "lists Child as overridden in GrandChild class" do
      get_overrides("GrandChild")[0][:owner].should == "Child"
    end

    it "lists GrandChild as overridden in GrandGrandChild class" do
      get_overrides("GrandGrandChild")[0][:owner].should == "GrandChild"
    end

  end


end
