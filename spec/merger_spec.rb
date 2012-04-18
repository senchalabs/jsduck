require "jsduck/merger"

describe JsDuck::Merger do

  def merge(doc, code)
    return JsDuck::Merger.new.merge(doc, code)
  end

  describe "only name in code" do
    before do
      @doc = merge(
        [{:tagname => :cfg, :type => "String", :doc => "My Config"}],
        {
          :tagname => :property,
          :name => "option",
        })
    end

    it "gets tagname from doc" do
      @doc[:tagname].should == :cfg
    end
    it "gets type from doc" do
      @doc[:type].should == "String"
    end
    it "gets documentation from doc" do
      @doc[:doc].should == "My Config"
    end
    it "gets name from code" do
      @doc[:name].should == "option"
    end
  end

  describe "most stuff in code" do
    before do
      @doc = merge(
        [{:tagname => :default, :doc => "Hello world"}],
        {
          :tagname => :property,
          :name => "some.prop",
          :type => "Boolean",
        })
    end

    it "gets tagname from code" do
      @doc[:tagname].should == :property
    end
    it "gets type from code" do
      @doc[:type].should == "Boolean"
    end
    it "gets documentation from doc" do
      @doc[:doc].should == "Hello world"
    end
    it "gets name from code" do
      @doc[:name].should == "prop"
    end
  end

end

