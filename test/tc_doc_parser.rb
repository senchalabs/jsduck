require "jsduck/doc_parser"
require "test/unit"

class TestDocParser < Test::Unit::TestCase

  def parse_single(doc)
    return JsDuck::DocParser.new.parse(doc)
  end

  def test_method
    doc = parse_single("/**
 * @method foo
 * Some docs.
 * @param {Number} x doc for x
 * @return {String} resulting value
 */")
    assert_equal(:method, doc[0][:tagname])
    assert_equal("foo", doc[0][:name])
    assert_equal("Some docs.", doc[0][:doc])

    assert_equal(:param, doc[1][:tagname])
    assert_equal("x", doc[1][:name])
    assert_equal("Number", doc[1][:type])
    assert_equal("doc for x", doc[1][:doc])

    assert_equal(:return, doc[2][:tagname])
    assert_equal("String", doc[2][:type])
    assert_equal("resulting value", doc[2][:doc])
  end

  def test_type_without_curlies
    doc = parse_single("/**
 * @type Boolean|String
 */")
    assert_equal(:type, doc[0][:tagname])
    assert_equal("Boolean|String", doc[0][:type])
  end

end

