require "jsduck/merger"

describe JsDuck::Merger do

  def merge(docset)
    return JsDuck::Merger.new.merge(docset)
  end

  describe "only name in code" do
    before do
      @doc = merge({
        :tagname => :cfg,
        :comment => {
          :tagname => :cfg,
          :name => nil,
          :meta => {},
          :type => "String",
          :doc => "My Config"
        },
        :code => {
          :tagname => :property,
          :name => "option",
        },
        :linenr => 15,
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
    it "keeps line number data" do
      @doc[:linenr].should == 15
    end
  end

  describe "most stuff in code" do
    before do
      @doc = merge({
        :tagname => :property,
        :comment => {
          :tagname => :property,
          :name => nil,
          :meta => {},
          :type => nil,
          :doc => "Hello world"
        },
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

