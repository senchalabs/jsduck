require "jsduck/class"
require "class_factory"

describe JsDuck::Class do

  describe "#find_members" do
    let (:cls) do
      classes = {}

      parent = Helper::ClassFactory.create({
        :name => "ParentClass",
        :members => [
          {:name => "inParent"},
          {:name => "alsoInParent"},
        ]
      });
      classes["ParentClass"] = parent
      parent.relations = classes

      parent = Helper::ClassFactory.create({
        :name => "MixinClass",
        :members => [
          {:name => "inMixin"},
          {:name => "alsoInMixin"},
        ]
      });
      classes["MixinClass"] = parent
      parent.relations = classes

      child = Helper::ClassFactory.create({
        :name => "ChildClass",
        :extends => "ParentClass",
        :mixins => ["MixinClass"],
        :members => [
          {:name => "inChild", :tagname => :method},
          {:name => "alsoInParent"},
          {:name => "alsoInMixin"},
          {:name => "childEvent", :tagname => :event},
        ]
      });
      classes["ChildClass"] = child
      child.relations = classes

      child
    end

    it "finds all members when called without arguments" do
      cls.find_members().length.should == 6
    end

    it "finds all properties by specifying tagname" do
      cls.find_members(:tagname => :property).length.should == 4
    end

    it "finds all methods by specifying tagname" do
      cls.find_members(:tagname => :method).length.should == 1
    end

    it "finds no members when specifying non-existing tagname" do
      cls.find_members(:tagname => :cfg).length.should == 0
    end

    it "finds no members when :static => true specified" do
      cls.find_members(:static => true).length.should == 0
    end

    it "finds all members when :static => false specified" do
      cls.find_members(:static => false).length.should == 6
    end

    it "finds member in itself" do
      cls.find_members(:name => "inChild").length.should == 1
    end

    it "finds member in parent" do
      cls.find_members(:name => "inParent").length.should == 1
    end

    it "finds member in mixin" do
      cls.find_members(:name => "inMixin").length.should == 1
    end

    it "finds overridden parent member" do
      cls.find_members(:name => "alsoInParent")[0][:owner].should == "ChildClass"
    end

    it "finds overridden mixin member" do
      cls.find_members(:name => "alsoInMixin")[0][:owner].should == "ChildClass"
    end

    it "finds just local members with :local=>true" do
      cls.find_members(:local => true).length.should == 4
    end

    it "finds a local member if :local=>true" do
      cls.find_members(:name => "inChild", :local => true).length.should == 1
    end

    it "doesn't find parent member if :local=>true" do
      cls.find_members(:name => "inParent", :local => true).length.should == 0
    end

    it "doesn't find mixin member if :local=>true" do
      cls.find_members(:name => "inMixin", :local => true).length.should == 0
    end
  end

  describe "#find_members with statics" do
    let (:cls) do
      classes = {}

      parent = Helper::ClassFactory.create({
        :name => "ParentClass",
        :members => [
          {:name => "inParent", :static => true},
          {:name => "inParentInheritable", :static => true, :inheritable => true},
        ]
      });
      classes["ParentClass"] = parent
      parent.relations = classes

      parent = Helper::ClassFactory.create({
        :name => "MixinClass",
        :members => [
          {:name => "inMixin", :static => true},
          {:name => "inMixinInheritable", :static => true, :inheritable => true},
        ]
      });
      classes["MixinClass"] = parent
      parent.relations = classes

      child = Helper::ClassFactory.create({
        :name => "ChildClass",
        :extends => "ParentClass",
        :mixins => ["MixinClass"],
        :members => [
          {:name => "inChild", :static => true},
          {:name => "inChildInheritable", :static => true, :inheritable => true},
        ]
      });
      classes["ChildClass"] = child
      child.relations = classes

      child
    end

    it "finds the static member in child" do
      cls.find_members(:name => "inChild", :static => true).length.should == 1
    end

    it "finds the static inheritable member in child" do
      cls.find_members(:name => "inChildInheritable", :static => true).length.should == 1
    end

    it "doesn't find the normal parent static member" do
      cls.find_members(:name => "inParent", :static => true).length.should == 0
    end

    it "finds the inheritable parent static member" do
      cls.find_members(:name => "inParentInheritable", :static => true).length.should == 1
    end

    it "doesn't find the normal parent mixin member" do
      cls.find_members(:name => "inMixin", :static => true).length.should == 0
    end

    it "finds the inheritable mixin static member" do
      cls.find_members(:name => "inMixinInheritable", :static => true).length.should == 1
    end

    it "finds all static members" do
      cls.find_members(:static => true).length.should == 4
    end

    it "finds no static members when :static=>false specified" do
      cls.find_members(:static => false).length.should == 0
    end
  end

  describe "when #find_members called before" do
    let (:parent) do
      Helper::ClassFactory.create({
        :name => "ParentClass",
        :members => [
          {:name => "oldName"},
        ]
      });
    end

    let (:child) do
      Helper::ClassFactory.create({
        :name => "ChildClass",
        :extends => "ParentClass",
        :members => [
          {:name => "oldName"},
        ]
      });
    end

    before do
      classes = {}

      classes["ParentClass"] = parent
      parent.relations = classes

      classes["ChildClass"] = child
      child.relations = classes

      child.find_members(:name => "oldName")

      child
    end

    describe "then after changing child member name" do
      before do
        child[:members][0][:name] = "changedName"
      end

      it "the new member can't be found" do
        child.find_members(:name => "changedName").length.should == 0
      end

      describe "and after calling #update_members!" do
        before do
          child.update_members!(child[:members])
        end

        it "the new member is now findable" do
          child.find_members(:name => "changedName").length.should == 1
        end
      end
    end

    describe "then after changing parent member tagname" do
      before do
        parent[:members][0][:tagname] = :method
      end

      it "the new member can't be found" do
        child.find_members(:tagname => :method).length.should == 0
      end

      describe "and after calling #update_members!" do
        before do
          child.update_members!(parent[:members])
        end

        it "the new member is now findable" do
          child.find_members(:tagname => :method).length.should == 1
        end
      end
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

end
