require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.result
  end

  def parse_id(string)
    parse(string)["global"][:members][0][:id]
  end

  it "event foo gets id event-foo" do
    id = parse_id(<<-EOF)
      /**
       * @event foo
       */
    EOF
    id.should == "event-foo"
  end

  it "config foo gets id cfg-foo" do
    id = parse_id(<<-EOF)
      /**
       * @cfg {String} foo
       */
    EOF
    id.should == "cfg-foo"
  end

  it "static property foo gets id static-property-foo" do
    id = parse_id(<<-EOF)
      /**
       * @property {String} foo
       * @static
       */
    EOF
    id.should == "static-property-foo"
  end

  it "static method foo gets id static-method-foo" do
    id = parse_id(<<-EOF)
      /**
       * @method foo
       * @static
       */
    EOF
    id.should == "static-method-foo"
  end

end
