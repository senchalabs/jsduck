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
        :members => {
          :method => [
            {:name => "foo", :owner => "ParentClass"},
            {:name => "bar", :owner => "ParentClass"},
            {:name => "zappa", :owner => "ParentClass"},
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
            {:name => "bar", :owner => "ChildClass"},
            {:name => "baz", :owner => "ChildClass"},
            {:name => "zappa", :owner => "ChildClass", :meta => {:hide => true}},
          ]
        }
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
