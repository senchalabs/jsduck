require "jsduck/exporter/full"
require "jsduck/class"
require "jsduck/relations"
require "class_factory"

describe JsDuck::Exporter::Full do

  describe "#export" do

    let(:cls) do
      Helper::ClassFactory.create({
        :name => "Foo",
        :members => [
          {:tagname => :cfg, :name => "foo"},
          {:tagname => :cfg, :name => "bar"},
          {:tagname => :cfg, :name => "zap"},
          {:tagname => :cfg, :name => "baz"},
          {:tagname => :method, :name => "addFoo"},
          {:tagname => :method, :name => "addBaz"},
          {:tagname => :method, :name => "constructor"},
          {:tagname => :method, :name => "statGet", :static => true},
          {:tagname => :event, :name => "beforebar"},
        ],
      })
    end

    let(:result) do
      JsDuck::Exporter::Full.new(JsDuck::Relations.new([cls])).export(cls)
    end

    it "places configs into :members->:cfg" do
      result[:members][:cfg].length.should == 4
    end

    it "places instance methods into :members->:method" do
      result[:members][:method].length.should == 3
    end

    it "places static methods into :statics->:method" do
      result[:statics][:method].length.should == 1
    end

    it "places events into :members->:event" do
      result[:members][:event].length.should == 1
    end

    it "places nothing into :members->:property as there are no properties" do
      result[:members][:property].length.should == 0
    end

    it "sorts configs alphabetically" do
      result[:members][:cfg].map {|m| m[:name] }.should == ["bar", "baz", "foo", "zap"]
    end

    it "sorts constructor first when sorting methods" do
      result[:members][:method].map {|m| m[:name] }.should == ["constructor", "addBaz", "addFoo"]
    end

  end

end
