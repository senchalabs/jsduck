require "doc_comment_parser"
require "test/unit"

class TestDocCommentParser < Test::Unit::TestCase

  def parse_single(doc)
    return JsDuck::DocCommentParser.new.parse(doc)[0]
  end

  def test_method
    doc = parse_single("/**
 * @method foo
 * Some docs.
 * @param {Number} x doc for x
 * @param {Integer} y doc for y
 * @return {String} resulting value
 */")
    assert_equal("foo", doc[:method][:name])
    assert_equal("Some docs.", doc[:method][:doc])

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

  def test_description_can_precede_method_tag
    doc = parse_single("/**
 * Method description
 * @param foo
 * @method blah
 * @return {String}
 */")
    assert_equal("blah", doc[:method][:name])
    assert_equal("Method description", doc[:method][:doc])
    assert_equal("foo", doc[:param][0][:name])
    assert_equal("String", doc[:return][:type])
  end

  def test_constructor
    doc = parse_single("/**
 * @constructor
 * Some docs.
 */")
    assert_equal("constructor", doc[:method][:name])
    assert_equal("Some docs.", doc[:method][:doc])
  end

  def test_class
    doc = parse_single("/**
 * @class my.package.Foo
 * @extends my.Bar
 * Some docs.
 * @singleton
 */")
    assert_equal("my.package.Foo", doc[:class][:name])
    assert_equal("my.Bar", doc[:class][:extends])
    assert_equal("Some docs.", doc[:class][:doc])
    assert_equal(true, doc[:class][:singleton])
  end

  def test_extends_implies_class
    doc = parse_single("/**
 * Class description
 * @extends my.Bar
 */")
    assert_equal("my.Bar", doc[:class][:extends])
    assert_equal("Class description", doc[:class][:doc])
  end

  def test_singleton_implies_class
    doc = parse_single("/**
 * Class description
 * @singleton
 */")
    assert_equal(true, doc[:class][:singleton])
    assert_equal("Class description", doc[:class][:doc])
  end

  def test_event
    doc = parse_single("/**
 * @event mousedown
 * Fires when the mouse button is depressed.
 */")
    assert_equal("mousedown", doc[:event][:name])
    assert_equal("Fires when the mouse button is depressed.", doc[:event][:doc])
  end

  def test_cfg
    doc = parse_single("/**
 * @cfg {Boolean} enabled
 * True to enable this.
 */")
    assert_equal("enabled", doc[:cfg][:name])
    assert_equal("Boolean", doc[:cfg][:type])
    assert_equal("True to enable this.", doc[:cfg][:doc])
  end

  def test_property
    doc = parse_single("/**
 * @property {Boolean} enabled
 * True when enabled.
 */")
    assert_equal("enabled", doc[:property][:name])
    assert_equal("Boolean", doc[:property][:type])
    assert_equal("True when enabled.", doc[:property][:doc])
  end

  def test_description_can_precede_property_tag
    doc = parse_single("/**
 * Property description
 * @property {Number} foo
 */")
    assert_equal("Property description", doc[:property][:doc])
    assert_equal("foo", doc[:property][:name])
    assert_equal("Number", doc[:property][:type])
  end

  def test_long_docs
    doc = parse_single("/**
 * @method foo
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
    assert_equal("Some docs.\n\nNice docs.", doc[:method][:doc])
    assert_equal("some\nlong\ndocs.", doc[:param][0][:doc])
    assert_equal("more\nlong\ndocs.", doc[:return][:doc])
  end

  def test_typeless_docs
    doc = parse_single("/**
 * @param x doc1
 * @return doc2
 */")
    assert_equal("x", doc[:param][0][:name])
    assert_equal("doc1", doc[:param][0][:doc])
    assert_equal("doc2", doc[:return][:doc])

    assert_equal(nil, doc[:param][0][:type])
    assert_equal(nil, doc[:return][:type])
  end

  def test_nameless_method
    doc = parse_single("/**
 * @method
 * Comment for this func.
 */")
    assert_equal(nil, doc[:method][:name])
    assert_equal("Comment for this func.", doc[:method][:doc])
  end

  def test_nameless_class
    doc = parse_single("/**
 * @class
 * Comment for this class.
 */")
    assert_equal(nil, doc[:class][:name])
    assert_equal("Comment for this class.", doc[:class][:doc])
  end

  def test_nameless_event
    doc = parse_single("/**
 * @event
 * Comment for event.
 */")
    assert_equal(nil, doc[:event][:name])
    assert_equal("Comment for event.", doc[:event][:doc])
  end

  def test_nameless_cfg
    doc = parse_single("/**
 * @cfg
 * Config comment.
 */")
    assert_equal(nil, doc[:cfg][:name])
    assert_equal("Config comment.", doc[:cfg][:doc])
  end

  def test_nameless_param
    doc = parse_single("/**
 * @param
 * My parameter.
 */")
    assert_equal(nil, doc[:param][0][:name])
    assert_equal("My parameter.", doc[:param][0][:doc])
  end
end

