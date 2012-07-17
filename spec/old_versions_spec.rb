require "jsduck/old_versions"

describe "JsDuck::OldVersions#generate_since_tags" do

  before do
    @versions = [
      {
        :version => "1.0", :classes => {
          "VeryOldClass" => {"cfg-foo" => true},
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
        :version => "3.0", :classes => JsDuck::OldVersions.current_version
      }
    ]

    @relations = [
      {:name => "VeryOldClass", :meta => {}, :alternateClassNames => [], :members => {
          :cfg => [{:id => "cfg-foo", :meta => {}}],
          :method => [{:id => "cfg-bar", :meta => {}}],
          :event => [{:id => "event-baz", :meta => {}}],
        }},
      {:name => "OldClass", :meta => {}, :alternateClassNames => []},
      {:name => "NewClass", :meta => {}, :alternateClassNames => []},
      {:name => "ClassWithNewName", :meta => {}, :alternateClassNames => ["ClassWithOldName"]},
    ].map {|cfg| JsDuck::Class.new(cfg) }

    JsDuck::OldVersions.generate_since_tags(@versions, @relations)
  end

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

  it "adds @since 1.0 to VeryOldClass#cfg-foo" do
    @relations[0][:members][:cfg][0][:meta][:since].should == "1.0"
  end

  it "adds @since 2.0 to VeryOldClass#method-bar" do
    @relations[0][:members][:method][0][:meta][:since].should == "2.0"
  end

  it "adds @since 3.0 to VeryOldClass#event-baz" do
    @relations[0][:members][:event][0][:meta][:since].should == "3.0"
  end

end
