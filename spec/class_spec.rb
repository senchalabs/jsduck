require "jsduck/class"

describe JsDuck::Class do

  # Avoid printed warnings in output
  before do
    JsDuck::Logger.instance.set_warning(:all, false)
  end

  describe "#members" do

    before do
      @classes = {}
      @parent = JsDuck::Class.new({
          :name => "ParentClass",
          :members => {
            :method => [
              {:name => "baz", :owner => "ParentClass"},
              {:name => "foo", :owner => "ParentClass"},
              {:name => "constructor", :owner => "ParentClass"},
              {:name => "frank", :owner => "ParentClass", :private => true},
            ]
          },
          :statics => {
            :method => [
              {:name => "parentA", :owner => "ParentClass"},
              {:name => "parentB", :owner => "ParentClass", :inheritable => true},
            ]
          }
        });
      @classes["ParentClass"] = @parent
      @parent.relations = @classes

      @mixin = JsDuck::Class.new({
          :name => "MixinClass",
          :members => {
            :method => [
              {:name => "xxx", :owner => "MixinClass"},
              {:name => "pri", :owner => "MixinClass", :private => true},
            ]
          },
          :statics => {
            :method => [
              {:name => "mixinA", :owner => "MixinClass"},
              {:name => "mixinB", :owner => "MixinClass", :inheritable => true},
            ]
          }
        });
      @classes["MixinClass"] = @mixin
      @mixin.relations = @classes

      @child = JsDuck::Class.new({
          :name => "ChildClass",
          :extends => "ParentClass",
          :mixins => ["MixinClass"],
          :members => {
            :method => [
              {:name => "foo", :owner => "ChildClass"},
              {:name => "bar", :owner => "ChildClass"},
              {:name => "zappa", :owner => "ChildClass", :private => true},
            ]
          },
          :statics => {
            :method => [
              {:name => "childA", :owner => "ChildClass"},
              {:name => "childB", :owner => "ChildClass", :inheritable => true},
            ]
          }
        });
      @classes["ChildClass"] = @child
      @child.relations = @classes

      @singletonChild = JsDuck::Class.new({
          :name => "Singleton",
          :extends => "ParentClass",
          :mixins => ["MixinClass"],
          :singleton => true,
          :members => {
            :method => [
              {:name => "sing", :owner => "Singleton"},
            ]
          },
          :statics => {
            :method => [
              {:name => "singStat", :owner => "Singleton"},
            ]
          }
        });
      @classes["Singleton"] = @singletonChild
      @singletonChild.relations = @classes
    end

    it "returns constructor as first method" do
      @members = @child.members(:method)
      @members.first[:name].should == "constructor"
    end

    describe "(:method)" do
      before do
        @members = @child.members_hash(:method)
      end

      it "returns all public members in current class" do
        @members.should have_key("foo")
        @members.should have_key("bar")
      end

      it "doesn't return private members of current class" do
        @members.should_not have_key("zappa")
      end

      it "inherites public members of parent class" do
        @members.should have_key("baz")
        @members.should have_key("foo")
      end

      it "doesn't inherit private members of parent class" do
        @members.should_not have_key("frank")
      end

      it "inherites public members of mixin classes" do
        @members.should have_key("xxx")
      end

      it "doesn't inherit private members of mixin classes" do
        @members.should_not have_key("pri")
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
          @members = @singletonChild.members_hash(:method)
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
        @members = @child.members_hash(:method, :statics)
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
          @members = @singletonChild.members_hash(:method, :statics)
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
