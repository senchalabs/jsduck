require "doc_comment"
require "test/unit"

class TestDocComment < Test::Unit::TestCase

  def test_function
    doc = JsDuck::DocComment.new("/**
 * @function foo
 * Some docs.
 * @param {Number} x doc for x
 * @param {Integer} y doc for y
 * @return {String} resulting value
 */")
    assert_equal("foo", doc[:function][:name])
    assert_equal("Some docs.", doc[:function][:doc])

    assert_equal(2, doc[:param].length)

    assert_equal("x", doc[:param][0][:name])
    assert_equal("Number", doc[:param][0][:type])
    assert_equal("doc for x", doc[:param][0][:doc])

    assert_equal("y", doc[:param][1][:name])
    assert_equal("Integer", doc[:param][1][:type])
    assert_equal("doc for y", doc[:param][1][:doc])

    assert_equal("String", doc[:return][:type])
    assert_equal("resulting value", doc[:return][:doc])
  end

  def test_class
    doc = JsDuck::DocComment.new("/**
 * @class my.package.Foo
 * @extends my.Bar
 * Some docs.
 */")
    assert_equal("my.package.Foo", doc[:class][:name])
    assert_equal("my.Bar", doc[:class][:extends])
    assert_equal("Some docs.", doc[:class][:doc])
  end

  def test_event
    doc = JsDuck::DocComment.new("/**
 * @event mousedown
 * Fires when the mouse button is depressed.
 */")
    assert_equal("mousedown", doc[:event][:name])
    assert_equal("Fires when the mouse button is depressed.", doc[:event][:doc])
  end

  def test_long_docs
    doc = JsDuck::DocComment.new("/**
 * @function foo
 *
 * Some docs.
 *
 * Nice docs.
 *
 * @param {Number} x some
 * long
 * docs.
 * @return {String} more
 * long
 * docs.
 */")
    assert_equal("Some docs.\n\nNice docs.", doc[:function][:doc])
    assert_equal("some\nlong\ndocs.", doc[:param][0][:doc])
    assert_equal("more\nlong\ndocs.", doc[:return][:doc])
  end

  def test_typeless_docs
    doc = JsDuck::DocComment.new("/**
 * @param x doc1
 * @return doc2
 */")
    assert_equal("x", doc[:param][0][:name])
    assert_equal("doc1", doc[:param][0][:doc])
    assert_equal("doc2", doc[:return][:doc])

    assert_equal(nil, doc[:param][0][:type])
    assert_equal(nil, doc[:return][:type])
  end
end

