require "jsduck/categories"

describe JsDuck::Categories do

  describe "splitting to one column" do
    before do
      categories = JsDuck::Categories.new({})
      @cols = categories.split_to_columns([
          {"classes" => ["1", "2", "3"]},
          {"classes" => ["4", "5"]},
          {"classes" => ["6"]},
        ], 1)
    end

    it "creates just one column" do
      @cols.length.should == 1
    end

    it "places all groups to first column" do
      @cols[0].length.should == 3
    end
  end

  describe "splitting to two equal-height columns" do
    before do
      categories = JsDuck::Categories.new({})
      @cols = categories.split_to_columns([
          {"classes" => ["1", "2", "3", "4", "5", "6"]}, # 6+3 = 9
          {"classes" => ["7", "8"]}, # 2+3 = 5
          {"classes" => ["9"]}, # 1+3 = 4
        ], 2)
    end

    it "creates two columns" do
      @cols.length.should == 2
    end

    it "places first group to first column" do
      @cols[0].length.should == 1
    end

    it "places other two groups to second column" do
      @cols[1].length.should == 2
    end
  end

  describe "splitting one group to two columns" do
    before do
      categories = JsDuck::Categories.new({})
      @cols = categories.split_to_columns([
          {"classes" => ["1", "2"]}
        ], 2)
    end

    it "creates two columns" do
      @cols.length.should == 2
    end

    it "places first group to first column" do
      @cols[0].length.should == 1
    end

    it "leaves the second column empty" do
      @cols[1].length.should == 0
    end
  end

end
