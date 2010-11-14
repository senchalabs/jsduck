require "jsduck/merger"
require "test/unit"

class TestMerger < Test::Unit::TestCase

  def merge(doc, code)
    return JsDuck::Merger.new.merge(doc, code)
  end

  def test_cfg
    doc = merge([
                 {:tagname => :cfg, :type => "String", :doc => "My Config"},
                ],
                {:type => :assignment, :left => ["option"]}
                )

    assert_equal(:cfg, doc[:tagname])
    assert_equal("String", doc[:type])
    assert_equal("My Config", doc[:doc])
    assert_equal("option", doc[:name])
  end

  def test_property
    doc = merge([{:tagname => :default, :doc => "Hello world"}],
                {:type => :assignment, :left => ["some", "prop"], :right => {:type => :literal, :class => "Boolean"}}
                )

    assert_equal(:property, doc[:tagname])
    assert_equal("Boolean", doc[:type])
    assert_equal("Hello world", doc[:doc])
    assert_equal("prop", doc[:name])
  end

end

