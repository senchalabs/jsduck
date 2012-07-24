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
          :cfg => [
            {:id => "cfg-foo", :meta => {}},
            {:id => "cfg-bar", :meta => {}},
            {:id => "cfg-baz", :meta => {}},
            {:id => "cfg-zap", :meta => {:since => "1.0"}},
            {:id => "cfg-new", :meta => {:new => true}},
          ],
        }},
      {:name => "OldClass", :meta => {}, :alternateClassNames => []},
      {:name => "NewClass", :meta => {}, :alternateClassNames => []},
      {:name => "ClassWithNewName", :meta => {}, :alternateClassNames => ["ClassWithOldName"]},
      {:name => "ExplicitSinceClass", :meta => {:since => "1.0"}, :alternateClassNames => []},
      {:name => "ExplicitNewClass", :meta => {:new => true}, :alternateClassNames => []},
    ].map {|cfg| JsDuck::Class.new(cfg) }

    JsDuck::Importer.generate_since_tags(@versions, @relations)

    # build className/member index for easy lookup in specs
    @stuff = {}
    @relations.each do |cls|
      @stuff[cls[:name]] = cls[:meta]
      configs = cls[:members] && cls[:members][:cfg]
      (configs || []).each do |cfg|
        @stuff[cls[:name]+"#"+cfg[:id]] = cfg[:meta]
      end
    end
  end

  # @since

  it "adds @since 1.0 to VeryOldClass" do
    @stuff["VeryOldClass"][:since].should == "1.0"
  end

  it "adds @since 2.0 to OldClass" do
    @stuff["OldClass"][:since].should == "2.0"
  end

  it "adds @since 3.0 to NewClass" do
    @stuff["NewClass"][:since].should == "3.0"
  end

  it "adds @since 2.0 to ClassWithNewName" do
    @stuff["ClassWithNewName"][:since].should == "2.0"
  end

  it "doesn't override explicit @since 1.0 in ExplicitSinceClass" do
    @stuff["ExplicitSinceClass"][:since].should == "1.0"
  end

  it "adds @since 1.0 to #foo" do
    @stuff["VeryOldClass#cfg-foo"][:since].should == "1.0"
  end

  it "adds @since 2.0 to #bar" do
    @stuff["VeryOldClass#cfg-bar"][:since].should == "2.0"
  end

  it "adds @since 3.0 to #baz" do
    @stuff["VeryOldClass#cfg-baz"][:since].should == "3.0"
  end

  it "doesn't override explicit @since 1.0 in #zap" do
    @stuff["VeryOldClass#cfg-zap"][:since].should == "1.0"
  end

  # @new

  it "doesn't add @new to VeryOldClass" do
    @stuff["VeryOldClass"][:new].should_not == true
  end

  it "doesn't add @new to OldClass" do
    @stuff["OldClass"][:new].should_not == true
  end

  it "adds @new to NewClass" do
    @stuff["NewClass"][:new].should == true
  end

  it "doesn't add @new to ClassWithNewName" do
    @stuff["ClassWithNewName"][:new].should_not == true
  end

  it "doesn't add @new to ExplicitSinceClass" do
    @stuff["ExplicitSinceClass"][:new].should_not == true
  end

  it "keeps explicit @new on ExplicitNewClass" do
    # Though it seems like a weird case, there could be a situation
    # where 1.0 had class Foo, which was removed in 2.0, but in 3.0 a
    # completely unrelated Foo class was introduced.
    @stuff["ExplicitNewClass"][:new].should == true
  end

  it "doesn't add @new to #foo" do
    @stuff["VeryOldClass#cfg-foo"][:new].should_not == true
  end

  it "doesn't add @new to #bar" do
    @stuff["VeryOldClass#cfg-bar"][:new].should_not == true
  end

  it "adds @new to #baz" do
    @stuff["VeryOldClass#cfg-baz"][:new].should == true
  end

  it "doesn't add @new to #zap" do
    @stuff["VeryOldClass#cfg-zap"][:new].should_not == true
  end

  it "keeps explicit @new in #new" do
    @stuff["VeryOldClass#cfg-new"][:new].should == true
  end

end
