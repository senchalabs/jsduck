require "jsduck/tree_icons"

describe JsDuck::TreeIcons do

  before do
    @icons = JsDuck::TreeIcons.new.extract_icons({
        :clsName => "apidocs",
        :iconCls => "icon-docs",
        :text => "API Documentation",
        :singleClickExpand => true,
        :children => [
          {
            :clsName => "pkg-SamplePackage",
            :text => "SamplePackage",
            :iconCls => "icon-pkg",
            :cls => "package",
            :singleClickExpand => true,
            :children => [
              {
                :href => "output/SamplePackage.Component.html",
                :text => "Component",
                :clsName => "SamplePackage.Component",
                :isClass => true,
                :iconCls => "icon-cmp",
                :cls => "cls",
                :leaf => true
              },
              {
                :href => "output/SamplePackage.Singleton.html",
                :text => "Singleton",
                :clsName => "SamplePackage.Singleton",
                :isClass => true,
                :iconCls => "icon-static",
                :cls => "cls",
                :leaf => true
              },
              {
                :clsName => "pkg-SamplePackage",
                :text => "sub",
                :iconCls => "icon-pkg",
                :cls => "package",
                :singleClickExpand => true,
                :children => [
                  {
                    :href => "output/SamplePackage.sub.Foo.html",
                    :text => "Foo",
                    :clsName => "SamplePackage.sub.Foo",
                    :isClass => true,
                    :iconCls => "icon-cls",
                    :cls => "cls",
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
    @icons["SamplePackage.Component"].should == "icon-cmp"
    @icons["SamplePackage.Singleton"].should == "icon-static"
  end

  it "extracts icons inside all subpackages too" do
    @icons["SamplePackage.sub.Foo"].should == "icon-cls"
  end

end

