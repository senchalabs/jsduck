require "jsduck/class"

describe JsDuck::Class do

  describe "#members_hash" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
          :name => "ParentClass",
          :method => [
            {:name => "baz", :member => "ParentClass"},
            {:name => "foo", :member => "ParentClass"},
            {:name => "frank", :member => "ParentClass", :private => true},
          ]
        }, @classes);
      @classes["ParentClass"] = @parent
      @child = JsDuck::Class.new({
          :name => "ChildClass",
          :extends => "ParentClass",
          :method => [
            {:name => "foo", :member => "ChildClass"},
            {:name => "bar", :member => "ChildClass"},
            {:name => "zappa", :member => "ChildClass", :private => true},
          ]
        }, @classes);
      @classes["ChildClass"] = @child
    end

    it "returns all public members in current class" do
      ms = @parent.members_hash(:method)
      ms.values.length.should == 2
      ms["foo"][:member].should == "ParentClass"
      ms["baz"][:member].should == "ParentClass"
    end

    it "also returns all public members in parent class" do
      ms = @child.members_hash(:method)
      ms.values.length.should == 3
      ms["foo"][:member].should == "ChildClass"
      ms["bar"][:member].should == "ChildClass"
      ms["baz"][:member].should == "ParentClass"
    end
  end

  describe "#inherits_from" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
        :name => "Parent",
      }, @classes);
      @classes["Parent"] = @parent

      @child = JsDuck::Class.new({
        :name => "Child",
        :extends => "Parent",
      }, @classes);
      @classes["Child"] = @child

      @grandchild = JsDuck::Class.new({
        :name => "GrandChild",
        :extends => "Child",
      }, @classes);
      @classes["GrandChild"] = @grandchild
    end

    it "true when asked about itself" do
      @parent.inherits_from?("Parent").should == true
    end

    it "false when asked about class it's not inheriting from" do
      @parent.inherits_from?("Child").should == false
    end

    it "true when asked about direct parent" do
      @child.inherits_from?("Parent").should == true
    end

    it "true when asked about grandparent" do
      @grandchild.inherits_from?("Parent").should == true
    end
  end

  describe "when full_name like My.package.Cls" do

    before do
      @cls = JsDuck::Class.new({:name => "My.package.Cls",}, {});
    end

    it "#package_name contains all parts except the last" do
      @cls.package_name.should == "My.package"
    end

    it "#short_name contains only the last part" do
      @cls.short_name.should == "Cls"
    end
  end

  describe "when full_name like My.Package.Cls" do

    before do
      @cls = JsDuck::Class.new({:name => "My.Package.Cls",}, {});
    end

    it "#package_name contains only first part" do
      @cls.package_name.should == "My"
    end

    it "#short_name contains remaining parts" do
      @cls.short_name.should == "Package.Cls"
    end
  end

  describe "when full_name has no parts" do

    before do
      @cls = JsDuck::Class.new({:name => "Foo",}, {});
    end

    it "#package_name is empty" do
      @cls.package_name.should == ""
    end

    it "#short_name is the same as full_name" do
      @cls.short_name.should == "Foo"
    end
  end

  describe "when full_name has two uppercase parts" do

    before do
      @cls = JsDuck::Class.new({:name => "Foo.Bar",}, {});
    end

    it "#package_name is first part" do
      @cls.package_name.should == "Foo"
    end

    it "#short_name is second part" do
      @cls.short_name.should == "Bar"
    end
  end

end
