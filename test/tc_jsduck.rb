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

end

