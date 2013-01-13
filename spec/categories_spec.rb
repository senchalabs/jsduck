require "jsduck/categories/factory"

describe JsDuck::Categories::Factory do

  # Small helper to check the sums
  def sum(arr)
    arr.reduce(0) {|sum,x| sum + x }
  end

  # Replace the sum method with the one that simply sums the numbers,
  # so we can use simpler test-data.
  class JsDuck::Categories::Factory
    def sum(arr)
      arr.reduce(0) {|sum,x| sum + x }
    end
  end

  describe "#split" do
    before do
      @categories = JsDuck::Categories::Factory.new([], {}, {})
    end

    it "split(1 item by 1)" do
      @cols = @categories.split([2], 1)
      @cols.length.should == 1
      sum(@cols[0]).should == 2
    end

    it "split(3 items by 1)" do
      @cols = @categories.split([1, 2, 3], 1)
      @cols.length.should == 1
      sum(@cols[0]).should == 6
    end

    it "split(3 items to two equal-height columns)" do
      @cols = @categories.split([1, 2, 3], 2)
      @cols.length.should == 2
      sum(@cols[0]).should == 3
      sum(@cols[1]).should == 3
    end

    it "split(1 item by 3)" do
      @cols = @categories.split([2], 3)
      @cols.length.should == 3
      sum(@cols[0]).should == 2
      sum(@cols[1]).should == 0
      sum(@cols[2]).should == 0
    end

    it "split(3 items by 3)" do
      @cols = @categories.split([1, 2, 3], 3)
      @cols.length.should == 3
      sum(@cols[0]).should == 1
      sum(@cols[1]).should == 2
      sum(@cols[2]).should == 3
    end

    it "split(6 items by 3)" do
      @cols = @categories.split([5, 8, 4, 2, 1, 3], 3)
      @cols.length.should == 3
      sum(@cols[0]).should <= 10
      sum(@cols[1]).should <= 10
      sum(@cols[2]).should <= 10
    end

    it "split(8 items by 3)" do
      @cols = @categories.split([1, 3, 5, 2, 1, 4, 2, 3], 3)
      @cols.length.should == 3
      sum(@cols[0]).should <= 9
      sum(@cols[1]).should <= 9
      sum(@cols[2]).should <= 9
    end
  end

end
