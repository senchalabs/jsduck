require "jsduck/importer"

describe "JsDuck::Importer#generate_since_tags" do

  before do
    @versions = [
      {
        :version => "1.0", :classes => {
          "VeryOldClass" => {"cfg-foo" => true},
          "ExplicitNewClass" => {},
        },
      },
      {
        :version => "2.0", :classes => {
          "VeryOldClass" => {"cfg-foo" => true, "cfg-bar" => true},
          "OldClass" => {},
          "ClassWithOldName" => {},
        },
      },
      {
        :version => "3.0", :classes => JsDuck::Importer.current_version
      }
    ]

    @relations = [
      {:name => "VeryOldClass", :meta => {}, :alternateClassNames => [], :members => {
          :cfg => [{:id => "cfg-foo", :meta => {}}],
          :method => [{:id => "cfg-bar", :meta => {}}],
          :event => [{:id => "event-baz", :meta => {}}],
          :property => [
            {:id => "property-zap", :meta => {:since => "1.0"}},
            {:id => "property-new", :meta => {:new => true}},
          ],
        }},
      {:name => "OldClass", :meta => {}, :alternateClassNames => []},
      {:name => "NewClass", :meta => {}, :alternateClassNames => []},
      {:name => "ClassWithNewName", :meta => {}, :alternateClassNames => ["ClassWithOldName"]},
      {:name => "ExplicitClass", :meta => {:since => "1.0"}, :alternateClassNames => []},
      {:name => "ExplicitNewClass", :meta => {:new => true}, :alternateClassNames => []},
    ].map {|cfg| JsDuck::Class.new(cfg) }

    JsDuck::Importer.generate_since_tags(@versions, @relations)
  end

  # @since

  it "adds @since 1.0 to VeryOldClass" do
    @relations[0][:meta][:since].should == "1.0"
  end

  it "adds @since 2.0 to OldClass" do
    @relations[1][:meta][:since].should == "2.0"
  end

  it "adds @since 3.0 to NewClass" do
    @relations[2][:meta][:since].should == "3.0"
  end

  it "adds @since 2.0 to ClassWithNewName" do
    @relations[3][:meta][:since].should == "2.0"
  end

  it "doesn't override explicit @since 1.0 in ExplicitClass" do
    @relations[4][:meta][:since].should == "1.0"
  end

  it "adds @since 1.0 to VeryOldClass#cfg-foo" do
    @relations[0][:members][:cfg][0][:meta][:since].should == "1.0"
  end

  it "adds @since 2.0 to VeryOldClass#method-bar" do
    @relations[0][:members][:method][0][:meta][:since].should == "2.0"
  end

  it "adds @since 3.0 to VeryOldClass#event-baz" do
    @relations[0][:members][:event][0][:meta][:since].should == "3.0"
  end

  it "doesn't override explicit @since 1.0 in VeryOldClass#property-zap" do
    @relations[0][:members][:property][0][:meta][:since].should == "1.0"
  end

  # @new

  it "doesn't add @new to VeryOldClass" do
    @relations[0][:meta][:new].should_not == true
  end

  it "doesn't add @new to OldClass" do
    @relations[1][:meta][:new].should_not == true
  end

  it "adds @new to NewClass" do
    @relations[2][:meta][:new].should == true
  end

  it "doesn't add @new to ClassWithNewName" do
    @relations[3][:meta][:new].should_not == true
  end

  it "doesn't add @new to ExplicitClass" do
    @relations[4][:meta][:new].should_not == true
  end

  it "keeps explicit @new on ExplicitNewClass" do
    # Though it seems like a weird case, there could be a situation
    # where 1.0 had class Foo, which was removed in 2.0, but in 3.0 a
    # completely unrelated Foo class was introduced.
    @relations[5][:meta][:new].should == true
  end

  it "doesn't add @new to VeryOldClass#cfg-foo" do
    @relations[0][:members][:cfg][0][:meta][:new].should_not == true
  end

  it "doesn't add @new to VeryOldClass#method-bar" do
    @relations[0][:members][:method][0][:meta][:new].should_not == true
  end

  it "adds @new to VeryOldClass#event-baz" do
    @relations[0][:members][:event][0][:meta][:new].should == true
  end

  it "doesn't add @new to VeryOldClass#property-zap" do
    @relations[0][:members][:property][0][:meta][:new].should_not == true
  end

  it "keeps explicit @new in VeryOldClass#property-new" do
    @relations[0][:members][:property][1][:meta][:new].should == true
  end

end
