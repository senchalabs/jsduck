require "jsduck"
require "test/unit"

class TestJsDuck < Test::Unit::TestCase

  def test_implicit_property_type
    comment = "
/**
 * @property
 */
"
    docs = JsDuck.parse(comment + "foo: 'haha',")
    assert_equal("String", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: 123,")
    assert_equal("Number", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: /^123/,")
    assert_equal("RegExp", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: true,")
    assert_equal("Boolean", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: false,")
    assert_equal("Boolean", docs[0][:type])
    docs = JsDuck.parse(comment + "foo: function(){},")
    assert_equal("Function", docs[0][:type])
    docs = JsDuck.parse(comment + "function foo(){},")
    assert_equal("Function", docs[0][:type])
  end

  def test_visibility_modifiers
    ["@private", "@hide", "@ignore", "@protected"].each do |tagname|
      docs = JsDuck.parse("/**\n * #{tagname}\n */");
      assert_equal(true, docs[0][:private])
    end
  end

  def test_static_method
    docs = JsDuck.parse("/**
 * @method
 * @static
 */");
    assert_equal(true, docs[0][:static])
  end

  def test_static_property
    docs = JsDuck.parse("/**
 * @property
 * @static
 */");
    assert_equal(true, docs[0][:static])
  end

end

