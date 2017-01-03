require "jsduck/file_categories"

describe JsDuck::FileCategories do

  describe "#expand" do
    before do
      classes = [
        {:name => "Foo.Ahem"},
        {:name => "Foo.Ahum"},
        {:name => "Foo.Blah"},
        {:name => "Bar.Ahhh"},
      ]
      @categories = JsDuck::FileCategories.new("", classes)
    end

    it "expands class without * in name into the same class" do
      @categories.expand("Foo.Ahem").should == ["Foo.Ahem"]
    end

    it "expands Foo.* into all classes in Foo namespace" do
      @categories.expand("Foo.*").should == ["Foo.Ahem", "Foo.Ahum", "Foo.Blah"]
    end

    it "expands Foo.A* into all classes in Foo namespace beginning with A" do
      @categories.expand("Foo.A*").should == ["Foo.Ahem", "Foo.Ahum"]
    end

    it "expands to empty array if no classes match the pattern" do
      @categories.expand("Bazz*").should == []
    end
  end

end
