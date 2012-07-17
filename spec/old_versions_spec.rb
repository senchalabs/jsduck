require "jsduck/old_versions"

describe "JsDuck::OldVersions#generate_since_tags" do

  before do
    @versions = [
      {
        :version => "1.0", :classes => {
          "VeryOldClass" => {},
        },
      },
      {
        :version => "2.0", :classes => {
          "VeryOldClass" => {},
          "OldClass" => {},
        },
      },
      {
        :version => "3.0", :classes => JsDuck::OldVersions.current_version
      }
    ]
    @relations = [
      {:name => "VeryOldClass", :meta => {}},
      {:name => "OldClass", :meta => {}},
      {:name => "NewClass", :meta => {}},
    ]
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

end
