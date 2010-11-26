require "jsduck/class"
require "test/unit"

class TestClass < Test::Unit::TestCase

  def test_local_members
    cls = JsDuck::Class.new({
      :name => "MyClass",
      :method => [
        {:name => "foo"},
        {:name => "bar"},
      ]
    });

    ms = cls.members_hash(:method)
    assert_equal(2, ms.values.length)
    assert_equal("MyClass", ms["foo"][:member])
    assert_equal("MyClass", ms["bar"][:member])
  end

  def test_parent_members
    classes = {}
    parent = JsDuck::Class.new({
      :name => "ParentClass",
      :method => [
        {:name => "baz"},
        {:name => "foo"},
      ]
    }, classes);
    classes["ParentClass"] = parent
    child = JsDuck::Class.new({
      :name => "MyClass",
      :extends => "ParentClass",
      :method => [
        {:name => "foo"},
        {:name => "bar"},
      ]
    }, classes);
    classes["MyClass"] = child

    ms = child.members_hash(:method)
    assert_equal(3, ms.values.length)
    assert_equal("MyClass", ms["foo"][:member], "foo should be overridden in child class")
    assert_equal("MyClass", ms["bar"][:member], "bar is only in child class")
    assert_equal("ParentClass", ms["baz"][:member], "baz is only in parent class")
  end

  def test_inherits_from
    classes = {}
    parent = JsDuck::Class.new({
      :name => "Parent",
    }, classes);
    classes["Parent"] = parent

    child = JsDuck::Class.new({
      :name => "Child",
      :extends => "Parent",
    }, classes);
    classes["Child"] = child

    grandchild = JsDuck::Class.new({
      :name => "GrandChild",
      :extends => "Child",
    }, classes);
    classes["GrandChild"] = grandchild

    assert_equal(true, parent.inherits_from?("Parent"), "Parent inherits from Parent")
    assert_equal(false, parent.inherits_from?("Child"), "Parent does not inherit from Child")

    assert_equal(true, child.inherits_from?("Parent"), "Child inherits from Parent")

    assert_equal(true, grandchild.inherits_from?("Parent"), "GrandChild inherits from Parent")
    assert_equal(true, grandchild.inherits_from?("Child"), "GrandChild inherits from Child")
  end

end

