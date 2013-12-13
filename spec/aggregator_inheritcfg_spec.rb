require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/class"
require "jsduck/relations"
require "jsduck/inherit_doc"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    relations = JsDuck::Relations.new(agr.result.map {|cls| JsDuck::Class.new(cls) })
    JsDuck::InheritDoc.new(relations).resolve_all
    relations
  end

  describe "auto-detected property overriding property in parent" do
    let(:classes) do
      parse(<<-EOS)
        /** */
        Ext.define("Parent", {
            /** @property */
            blah: 7
        });

        /** */
        Ext.define("Child", {
            extend: "Parent",
            blah: 8
        });
      EOS
    end

    it "detects a property in parent" do
      classes["Parent"][:members][0][:tagname].should == :property
    end

    it "detects a property in child" do
      classes["Child"][:members][0][:tagname].should == :property
    end

    it "detects property in child as public" do
      classes["Child"][:members][0][:private].should_not == true
    end
  end

  describe "auto-detected property overriding config in parent" do
    let(:classes) do
      parse(<<-EOS)
        /** */
        Ext.define("Parent", {
            /** @cfg */
            blah: 7
        });

        /** */
        Ext.define("Child", {
            extend: "Parent",
            blah: 8
        });
      EOS
    end

    it "detects a config in parent" do
      classes["Parent"][:members][0][:tagname].should == :cfg
    end

    it "detects a config in child" do
      classes["Child"][:members][0][:tagname].should == :cfg
    end

    it "detects the child config with correct tagname" do
      classes["Child"][:members][0][:tagname] == :cfg
    end

    it "detects the child config with correct id" do
      classes["Child"][:members][0][:id] == "cfg-blah"
    end

    it "detects no properties in child" do
      classes["Child"][:members].length.should == 1
    end
  end

end

