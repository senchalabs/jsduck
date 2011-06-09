require "jsduck/class"

describe JsDuck::Class do

  describe "#members_hash" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
          :name => "ParentClass",
          :members => {
            :method => [
              {:name => "baz", :owner => "ParentClass"},
              {:name => "foo", :owner => "ParentClass"},
              {:name => "frank", :owner => "ParentClass", :private => true},
            ]
          }
        });
      @classes["ParentClass"] = @parent
      @parent.relations = @classes
      @child = JsDuck::Class.new({
          :name => "ChildClass",
          :extends => "ParentClass",
          :members => {
            :method => [
              {:name => "foo", :owner => "ChildClass"},
              {:name => "bar", :owner => "ChildClass"},
              {:name => "zappa", :owner => "ChildClass", :private => true},
            ]
          }
        });
      @classes["ChildClass"] = @child
      @child.relations = @classes
    end

    it "returns all public members in current class" do
      ms = @parent.members_hash(:method)
      ms.values.length.should == 2
      ms["foo"][:owner].should == "ParentClass"
      ms["baz"][:owner].should == "ParentClass"
    end

    it "also returns all public members in parent class" do
      ms = @child.members_hash(:method)
      ms.values.length.should == 3
      ms["foo"][:owner].should == "ChildClass"
      ms["bar"][:owner].should == "ChildClass"
      ms["baz"][:owner].should == "ParentClass"
    end
  end

  describe "#members(:method)" do
    before do
      @classes = {}
      @parent = JsDuck::Class.new({
          :name => "ParentClass",
          :members => {
            :method => [
              {:name => "baz", :owner => "ParentClass"},
              {:name => "constructor", :owner => "ParentClass"},
            ]
          }
        });
      @classes["ParentClass"] = @parent
      @parent.relations = @classes
      @child = JsDuck::Class.new({
          :name => "ChildClass",
          :extends => "ParentClass",
          :members => {
            :method => [
              {:name => "foo", :owner => "ChildClass"}
            ]
          }
        });
      @classes["ChildClass"] = @child
      @child.relations = @classes
    end

    it "returns constructor as first method" do
      ms = @child.members(:method)
      ms.first[:name].should == "constructor"
    end
  end

  describe "#inherits_from" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
        :name => "Parent",
      });
      @classes["Parent"] = @parent
      @parent.relations = @classes

      @child = JsDuck::Class.new({
        :name => "Child",
        :extends => "Parent",
      });
      @classes["Child"] = @child
      @child.relations = @classes

      @grandchild = JsDuck::Class.new({
        :name => "GrandChild",
        :extends => "Child",
      });
      @classes["GrandChild"] = @grandchild
      @grandchild.relations = @classes
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
      @cls = JsDuck::Class.new({:name => "My.package.Cls",});
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
      @cls = JsDuck::Class.new({:name => "My.Package.Cls",});
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
      @cls = JsDuck::Class.new({:name => "Foo",});
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
      @cls = JsDuck::Class.new({:name => "Foo.Bar",});
    end

    it "#package_name is first part" do
      @cls.package_name.should == "Foo"
    end

    it "#short_name is second part" do
      @cls.short_name.should == "Bar"
    end
  end

end
