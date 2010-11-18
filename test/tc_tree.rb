require "jsduck/tree"
require "test/unit"

class TestTree < Test::Unit::TestCase

  def test_create
    output = JsDuck::Tree.new.create([
      {:tagname => :class, :name => "SamplePackage.SampleClass"},
      {:tagname => :class, :name => "SamplePackage.Singleton", :singleton => true},
    ])
    assert_equal({
      :id => "apidocs",
      :iconCls => "icon-docs",
      :text => "API Documentation",
      :singleClickExpand => true,
      :children => [
        {
          :id => "pkg-SamplePackage",
          :text => "SamplePackage",
          :iconCls => "icon-pkg",
          :cls => "package",
          :singleClickExpand => true,
          :children => [
            {
              :href => "output/SamplePackage.SampleClass.html",
              :text => "SampleClass",
              :id => "SamplePackage.SampleClass",
              :isClass => true,
              :iconCls => "icon-cls",
              :cls => "cls",
              :leaf => true
            },
            {
              :href => "output/SamplePackage.Singleton.html",
              :text => "Singleton",
              :id => "SamplePackage.Singleton",
              :isClass => true,
              :iconCls => "icon-static",
              :cls => "cls",
              :leaf => true
            }
          ]
        }
      ]
    }, output)
  end

end

