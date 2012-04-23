require "jsduck/merger"

describe JsDuck::Merger do

  def merge(docset)
    return JsDuck::Merger.new.merge(docset)
  end

  describe "only name in code" do
    before do
      @doc = merge({
        :tagname => :cfg,
        :comment => [{:tagname => :cfg, :type => "String", :doc => "My Config"}],
        :code => {
          :tagname => :property,
          :name => "option",
        }
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
      @doc = merge({
        :tagname => :property,
        :comment => [{:tagname => :default, :doc => "Hello world"}],
        :code => {
          :tagname => :property,
          :name => "some.prop",
          :type => "Boolean",
        }
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

