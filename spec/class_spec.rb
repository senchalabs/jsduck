require "jsduck/class"

describe JsDuck::Class do

  def make_class(cfg)
    cfg[:members].each do |m|
      m[:tagname] = :property unless m[:tagname]
      m[:owner] = cfg[:name]
      m[:id] = (m[:static] ? "static-" : "") + (m[:tagname] ? "#{m[:tagname]}-" : "property-") + m[:name]
      m[:meta] = {} unless m[:meta]
      m[:meta][:static] = true if m[:static]
    end

    JsDuck::Class.new(cfg)
  end

  describe "#find_members" do
    let (:cls) do
      classes = {}

      parent = make_class({
        :name => "ParentClass",
        :members => [
          {:name => "inParent"},
          {:name => "alsoInParent"},
        ]
      });
      classes["ParentClass"] = parent
      parent.relations = classes

      parent = make_class({
        :name => "MixinClass",
        :members => [
          {:name => "inMixin"},
          {:name => "alsoInMixin"},
        ]
      });
      classes["MixinClass"] = parent
      parent.relations = classes

      child = make_class({
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

    it "finds no statics when there are no static members" do
      cls.find_members(:static => true).length.should == 0
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
  end

  describe "#find_members with statics" do
    let (:cls) do
      classes = {}

      parent = make_class({
        :name => "ParentClass",
        :members => [
          {:name => "inParent", :static => true},
          {:name => "inParentInheritable", :static => true, :inheritable => true},
        ]
      });
      classes["ParentClass"] = parent
      parent.relations = classes

      parent = make_class({
        :name => "MixinClass",
        :members => [
          {:name => "inMixin", :static => true},
          {:name => "inMixinInheritable", :static => true, :inheritable => true},
        ]
      });
      classes["MixinClass"] = parent
      parent.relations = classes

      child = make_class({
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
  end

  describe "#members" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
        :name => "ParentClass",
        :members => [
          {:tagname => :method, :name => "baz", :owner => "ParentClass"},
          {:tagname => :method, :name => "foo", :owner => "ParentClass"},
          {:tagname => :method, :name => "constructor", :owner => "ParentClass"},
          {:tagname => :method, :name => "frank", :owner => "ParentClass", :private => true},
          {:tagname => :method, :name => "zappa", :owner => "ParentClass", :private => false},
          {:tagname => :method, :name => "parentA", :owner => "ParentClass",
            :meta => {:static => true}},
          {:tagname => :method, :name => "parentB", :owner => "ParentClass",
            :inheritable => true, :meta => {:static => true}},
        ]
      });
      @classes["ParentClass"] = @parent
      @parent.relations = @classes

      @mixin = JsDuck::Class.new({
        :name => "MixinClass",
        :members => [
          {:tagname => :method, :name => "xxx", :owner => "MixinClass"},
          {:tagname => :method, :name => "pri", :owner => "MixinClass", :private => true},
          {:tagname => :method, :name => "mixinA", :owner => "MixinClass",
            :meta => {:static => true}},
          {:tagname => :method, :name => "mixinB", :owner => "MixinClass",
            :inheritable => true, :meta => {:static => true}},
        ]
      });
      @classes["MixinClass"] = @mixin
      @mixin.relations = @classes

      @child = JsDuck::Class.new({
        :name => "ChildClass",
        :extends => "ParentClass",
        :mixins => ["MixinClass"],
        :members => [
          {:tagname => :method, :name => "foo", :owner => "ChildClass"},
          {:tagname => :method, :name => "bar", :owner => "ChildClass"},
          {:tagname => :method, :name => "zappa", :owner => "ChildClass", :private => true},
          {:tagname => :method, :name => "childA", :owner => "ChildClass",
            :meta => {:static => true}},
          {:tagname => :method, :name => "childB", :owner => "ChildClass",
            :inheritable => true, :meta => {:static => true}},
        ]
      });
      @classes["ChildClass"] = @child
      @child.relations = @classes

      @singletonChild = JsDuck::Class.new({
        :name => "Singleton",
        :extends => "ParentClass",
        :mixins => ["MixinClass"],
        :singleton => true,
        :members => [
          {:tagname => :method, :name => "sing", :owner => "Singleton", :files => [{}]},
          {:tagname => :method, :name => "singStat", :owner => "Singleton", :files => [{}],
            :meta => {:static => true}},
        ]
      });
      @classes["Singleton"] = @singletonChild
      @singletonChild.relations = @classes
    end

    it "returns constructor as first method" do
      @members = @child.members(:method)
      @members.first[:name].should == "constructor"
    end

    def members_as_hash(cls, type, context=:members)
      h = {}
      cls.members(type, context).each {|m| h[m[:name]] = m }
      h
    end

    describe "(:method)" do
      before do
        @members = members_as_hash(@child, :method)
      end

      it "returns all members in current class" do
        @members.should have_key("foo")
        @members.should have_key("bar")
        @members.should have_key("zappa")
      end

      it "inherites members of parent class" do
        @members.should have_key("baz")
        @members.should have_key("foo")
        @members.should have_key("frank")
      end

      it "inherites members of mixin classes" do
        @members.should have_key("xxx")
        @members.should have_key("pri")
      end

      it "keeps ownership of current class members" do
        @members["bar"][:owner].should == "ChildClass"
      end

      it "keeps ownership of non-overridden parent class members" do
        @members["baz"][:owner].should == "ParentClass"
      end

      it "overrides parent class members with the same name" do
        @members["foo"][:owner].should == "ChildClass"
      end

      describe "singleton class" do
        before do
          @members = members_as_hash(@singletonChild, :method)
        end

        it "inherits all instance members from parent" do
          @members.should have_key("baz")
          @members.should have_key("foo")
        end

        it "inherits all instace members from mixins" do
          @members.should have_key("xxx")
        end

        it "lists its instance members" do
          @members.should have_key("sing")
        end

        it "lists its static members as if they were instance members" do
          @members.should have_key("singStat")
        end
      end
    end

    describe "(:method, :statics)" do
      before do
        @members = members_as_hash(@child, :method, :statics)
      end

      it "returns normal statics in current class" do
        @members.should have_key("childA")
      end

      it "returns inheritableStatics in current class" do
        @members.should have_key("childB")
      end

      it "doesn't inherit normal statics from parent class" do
        @members.should_not have_key("parentA")
      end

      it "inherits inheritableStatics from parent class" do
        @members.should have_key("parentB")
      end

      it "doesn't inherit normal statics from mixins" do
        @members.should_not have_key("mixinA")
      end

      it "inherits inheritableStatics from mixins" do
        @members.should have_key("mixinB")
      end

      describe "singleton class" do
        before do
          @members = members_as_hash(@singletonChild, :method, :statics)
        end

        it "doesn't inherit any static members from parent" do
          @members.should_not have_key("parentA")
          @members.should_not have_key("parentB")
        end

        it "doesn't inherit any static members from mixins" do
          @members.should_not have_key("mixinA")
          @members.should_not have_key("mixinB")
        end

        it "doesn't list any of his own static members" do
          @members.should_not have_key("singStat")
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
