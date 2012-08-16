require "jsduck/class"

# Test for the behavior of @hide tag

describe JsDuck::Class do

  def make_class(cfg)
    cfg[:members].each do |m|
      m[:tagname] = :property unless m[:tagname]
      m[:owner] = cfg[:name]
      m[:meta] = {} unless m[:meta]
      m[:meta][:static] = true if m[:static]
      m[:id] = JsDuck::Class.member_id(m)
    end

    JsDuck::Class.new(cfg)
  end

  def members_as_hash(cls)
    h = {}
    cls.find_members().each {|m| h[m[:name]] = m }
    h
  end

  before do
    @classes = {}
    @parent = make_class({
        :name => "ParentClass",
        :members => [
          {:name => "foo"},
          {:name => "bar"},
          {:name => "zappa"},
        ]
      });
    @classes["ParentClass"] = @parent
    @parent.relations = @classes

    @child = make_class({
        :name => "ChildClass",
        :extends => "ParentClass",
        :members => [
          {:name => "bar"},
          {:name => "baz"},
          {:name => "zappa", :meta => {:hide => true}},
        ]
      });
    @classes["ChildClass"] = @child
    @child.relations = @classes

    @members = members_as_hash(@child)
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
