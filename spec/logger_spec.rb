require "jsduck/logger"

describe JsDuck::Logger do
  let(:logger) do
    JsDuck::LoggerCls.new
  end

  let(:usual_warnings) do
    [:tag, :global, :link]
  end

  describe "by default" do
    it "has the nil warning enabled" do
      logger.warning_enabled?(nil, "").should == true
    end

    it "has the usual warnings disabled" do
      usual_warnings.each do |type|
        logger.warning_enabled?(type, "").should == false
      end
    end
  end

  describe "after enabling all warnings" do
    before do
      logger.set_warning(:all, true)
    end

    it "has the usual warnings disabled" do
      usual_warnings.each do |type|
        logger.warning_enabled?(type, "").should == true
      end
    end
  end

  shared_examples_for "limited to a path" do
    it "has the :tag warning disabled for /other/path/file.js" do
      logger.warning_enabled?(:tag, "/other/path/file.js").should == false
    end

    it "has the :tag warning enabled for /some/path/file.js" do
      logger.warning_enabled?(:tag, "/some/path/file.js").should == true
    end

    it "has the :tag warning enabled for /within/some/path/file.js" do
      logger.warning_enabled?(:tag, "/within/some/path/file.js").should == true
    end
  end

  describe "after enabling all warnings in /some/path" do
    before do
      logger.set_warning(:all, true, "/some/path")
    end

    it_should_behave_like "limited to a path"
  end

  describe "after enabling :tag warning in /some/path" do
    before do
      logger.set_warning(:tag, true, "/some/path")
    end

    it_should_behave_like "limited to a path"

    describe "and also enabling it in /other/path" do
      before do
        logger.set_warning(:tag, true, "/other/path")
      end

      it "has the :tag warning enabled for /some/path/file.js" do
        logger.warning_enabled?(:tag, "/some/path/file.js").should == true
      end

      it "has the :tag warning enabled for /other/path/file.js" do
        logger.warning_enabled?(:tag, "/other/path/file.js").should == true
      end
    end
  end

end
