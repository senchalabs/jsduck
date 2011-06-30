require "jsduck/tree_icons"

describe JsDuck::TreeIcons do

  before do
    @icons = JsDuck::TreeIcons.new.extract_icons({
        :id => "apidocs",
        :iconCls => "icon-docs",
        :text => "API Documentation",
        :children => [
          {
            :clsName => "pkg-SamplePackage",
            :text => "SamplePackage",
            :iconCls => "icon-pkg",
            :cls => "package",
            :children => [
              {
                :text => "Component",
                :url => "/api/SamplePackage.Component",
                :iconCls => "icon-cmp",
                :leaf => true
              },
              {
                :text => "Singleton",
                :url => "/api/SamplePackage.Singleton",
                :iconCls => "icon-static",
                :leaf => true
              },
              {
                :text => "sub",
                :iconCls => "icon-pkg",
                :children => [
                  {
                    :text => "Foo",
                    :url => "/api/SamplePackage.sub.Foo",
                    :iconCls => "icon-cls",
                    :leaf => true
                  },
                ]
              }
            ]
          }
        ]
      })
  end

  it "extracts as many icons as there are classes in tree" do
    @icons.length.should == 3
  end

  it "extracts icons inside a package" do
    @icons["/api/SamplePackage.Component"].should == "icon-cmp"
    @icons["/api/SamplePackage.Singleton"].should == "icon-static"
  end

  it "extracts icons inside all subpackages too" do
    @icons["/api/SamplePackage.sub.Foo"].should == "icon-cls"
  end

end

