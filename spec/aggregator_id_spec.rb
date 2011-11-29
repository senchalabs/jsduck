require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do
  before(:all) do
    @opts = {:meta_tags => JsDuck::MetaTagLoader.new.meta_tags}
  end

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string, "", @opts))
    agr.result
  end

  it "event foo gets id event-foo" do
    @member = parse(<<-EOF)[0]
      /**
       * @event foo
       */
    EOF
    @member[:id].should == "event-foo"
  end

  it "config foo gets id cfg-foo" do
    @member = parse(<<-EOF)[0]
      /**
       * @cfg {String} foo
       */
    EOF
    @member[:id].should == "cfg-foo"
  end

  it "static property foo gets id static-property-foo" do
    @member = parse(<<-EOF)[0]
      /**
       * @property {String} foo
       * @static
       */
    EOF
    @member[:id].should == "static-property-foo"
  end

  it "static method foo gets id static-method-foo" do
    @member = parse(<<-EOF)[0]
      /**
       * @method foo
       * @static
       */
    EOF
    @member[:id].should == "static-method-foo"
  end

end

