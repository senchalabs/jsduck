require "jsduck/class"
require "jsduck/tree"

describe JsDuck::Tree do

  before do
    @tree = JsDuck::Tree.new.create([
        JsDuck::Class.new({:tagname => :class, :name => "SamplePackage.SampleClass"}),
        JsDuck::Class.new({:tagname => :class, :name => "SamplePackage.Singleton", :singleton => true}),
      ])
  end

  describe "creates root node" do

    it "with special id, text and icons" do
      @tree[:id].should == "apidocs"
      @tree[:text].should == "API Documentation"
      @tree[:iconCls].should == "icon-docs"
    end

    it "with singleClickExpand = true" do
      @tree[:singleClickExpand].should == true
    end

    it "with as many children as there are root packages" do
      @tree[:children].length.should == 1
    end
  end

  describe "creates package nodes" do

    before do
      @package = @tree[:children][0]
    end

    it "with id reflecting package name" do
      @package[:id].should == "pkg-SamplePackage"
    end

    it "with text being package name" do
      @package[:text].should == "SamplePackage"
    end

    it "with icon being package icon" do
      @package[:iconCls].should == "icon-pkg"
    end

    it "with cls = 'package'" do
      @package[:cls].should == "package"
    end

    it "with singleClickExpand = true" do
      @package[:singleClickExpand].should == true
    end

    it "with as many children as there are classes inside this packages" do
      @package[:children].length.should == 2
    end
  end

  shared_examples_for "all class nodes" do

    it "with isClass = true" do
      @class[:isClass].should == true
    end

    it "with cls = 'cls'" do
      @class[:isClass].should == true
    end

    it "with id being full class name" do
      @class[:id].should == @full_class_name
    end

    it "with text being short class name" do
      @class[:text].should == @short_class_name
    end

    it "with href pointing to output/ClassName.html" do
      @class[:href].should == "output/" + @full_class_name + ".html"
    end

    it "with leaf = true" do
      @class[:leaf].should == true
    end
  end

  describe "creates normal class nodes" do

    before do
      @class = @tree[:children][0][:children][0]
      @short_class_name = "SampleClass"
      @full_class_name = "SamplePackage.SampleClass"
    end

    it_should_behave_like "all class nodes"

    it "with normal class icon" do
      @class[:iconCls].should == "icon-class"
    end
  end

  describe "creates singleton class nodes" do

    before do
      @class = @tree[:children][0][:children][1]
      @short_class_name = "Singleton"
      @full_class_name = "SamplePackage.Singleton"
    end

    it_should_behave_like "all class nodes"

    it "with singleton class icon" do
      @class[:iconCls].should == "icon-singleton"
    end
  end

end

describe JsDuck::Tree, "lowercase package name" do

  before do
    @tree = JsDuck::Tree.new.create([
        JsDuck::Class.new({:tagname => :class, :name => "Foo.bar.Baz"})
      ])
    @root = @tree[:children][0]
    @middle = @root[:children][0]
    @leaf = @middle[:children][0]
  end

  it "gets root package node" do
    @root[:cls].should == 'package'
  end

  it "gets middle package node" do
    @middle[:cls].should == 'package'
  end

  it "gets leaf class node" do
    @leaf[:cls].should == 'cls'
  end

end

describe JsDuck::Tree, "uppercase package name" do

  before do
    @tree = JsDuck::Tree.new.create([
        JsDuck::Class.new({:tagname => :class, :name => "Foo.Bar.Baz"})
      ])
    @root = @tree[:children][0]
    @middle = @root[:children][0]
  end

  it "gets root package node" do
    @root[:cls].should == 'package'
  end

  it "gets middle class node" do
    @middle[:cls].should == 'cls'
  end

  it "gets class name containing package name" do
    @middle[:text].should == 'Bar.Baz'
  end

end
