require "jsduck/class"

# Test for the behavior of @hide tag

describe JsDuck::Class do

  def members_as_hash(cls, type, context=:members)
    h = {}
    cls.members(type, context).each {|m| h[m[:name]] = m }
    h
  end

  before do
    @classes = {}
    @parent = JsDuck::Class.new({
        :name => "ParentClass",
        :members => [
          {:tagname => :method, :name => "foo", :owner => "ParentClass"},
          {:tagname => :method, :name => "bar", :owner => "ParentClass"},
          {:tagname => :method, :name => "zappa", :owner => "ParentClass"},
        ]
      });
    @classes["ParentClass"] = @parent
    @parent.relations = @classes

    @child = JsDuck::Class.new({
        :name => "ChildClass",
        :extends => "ParentClass",
        :members => [
          {:tagname => :method, :name => "bar", :owner => "ChildClass"},
          {:tagname => :method, :name => "baz", :owner => "ChildClass"},
          {:tagname => :method, :name => "zappa", :owner => "ChildClass", :meta => {:hide => true}},
        ]
      });
    @classes["ChildClass"] = @child
    @child.relations = @classes

    @members = members_as_hash(@child, :method)
  end

  it "has member that's inherited from parent" do
    @members.should have_key("foo")
  end

  it "has member that's overridden in child" do
    @members.should have_key("bar")
  end

  it "has member that's defined only in child" do
    @members.should have_key("baz")
  end

  it "doesn't have member that's tagged in child with @hide" do
    @members.should_not have_key("zappa")
  end

end
