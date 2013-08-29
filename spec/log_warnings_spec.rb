require "jsduck/log/warnings"

describe JsDuck::Log::Warnings do
  let(:warnings) do
    JsDuck::Log::Warnings.new
  end

  let(:usual_warnings) do
    [:tag, :global, :link]
  end

  describe "by default" do
    it "has the usual warnings disabled" do
      usual_warnings.each do |type|
        warnings.enabled?(type, "").should == false
      end
    end

    it "has the nodoc warning disabled" do
      warnings.enabled?(:nodoc, "", [:class, :public]).should == false
    end
  end

  describe "after enabling all warnings" do
    before do
      warnings.set(:all, true)
    end

    it "has the usual warnings enabled" do
      usual_warnings.each do |type|
        warnings.enabled?(type, "").should == true
      end
    end

    it "has the nodoc warning enabled" do
      warnings.enabled?(:nodoc, "", [:class, :public]).should == true
    end
  end

  shared_examples_for "limited to a path" do
    it "has the :tag warning disabled for /other/path/file.js" do
      warnings.enabled?(:tag, "/other/path/file.js").should == false
    end

    it "has the :tag warning enabled for /some/path/file.js" do
      warnings.enabled?(:tag, "/some/path/file.js").should == true
    end

    it "has the :tag warning enabled for /within/some/path/file.js" do
      warnings.enabled?(:tag, "/within/some/path/file.js").should == true
    end
  end

  describe "after enabling all warnings in /some/path" do
    before do
      warnings.set(:all, true, "/some/path")
    end

    it_should_behave_like "limited to a path"
  end

  describe "after enabling :tag warning in /some/path" do
    before do
      warnings.set(:tag, true, "/some/path")
    end

    it_should_behave_like "limited to a path"

    describe "and also enabling it in /other/path" do
      before do
        warnings.set(:tag, true, "/other/path")
      end

      it "has the :tag warning enabled for /some/path/file.js" do
        warnings.enabled?(:tag, "/some/path/file.js").should == true
      end

      it "has the :tag warning enabled for /other/path/file.js" do
        warnings.enabled?(:tag, "/other/path/file.js").should == true
      end
    end
  end

  describe "after enabling :nodoc warning" do
    before do
      warnings.set(:nodoc, true)
    end

    it "has the :nodoc warning enabled for a public class" do
      warnings.enabled?(:nodoc, "foo.js", [:class, :public]).should == true
    end

    it "has the :nodoc warning enabled for a private member" do
      warnings.enabled?(:nodoc, "bar.js", [:member, :private]).should == true
    end

    describe "and disabling it for private members" do
      before do
        warnings.set(:nodoc, false, nil, [:member, :private])
      end

      it "has the :nodoc warning disabled for a private member" do
        warnings.enabled?(:nodoc, "bar.js", [:member, :private]).should == false
      end

      it "still has the :nodoc warning enabled for public members" do
        warnings.enabled?(:nodoc, "bar.js", [:member, :public]).should == true
      end

      describe "and enabling it for files in /foo/" do
        before do
          warnings.set(:nodoc, true, "/foo/", [:member, :private])
        end

        it "has the :nodoc warning enabled for a private member in /foo/bar.js" do
          warnings.enabled?(:nodoc, "/foo/bar.js", [:member, :private]).should == true
        end

        it "still has the :nodoc warning disabled in private member of /blah/foo.js" do
          warnings.enabled?(:nodoc, "/blah/foo.js", [:member, :private]).should == false
        end
      end
    end
  end

  describe "for backwards compatibility" do
    describe ":no_doc warning" do
      before do
        warnings.set(:no_doc, true)
      end

      it "enables :nodoc warnings for public classes" do
        warnings.enabled?(:nodoc, "", [:class, :public]).should == true
        warnings.enabled?(:nodoc, "", [:class, :private]).should == false
        warnings.enabled?(:nodoc, "", [:member, :public]).should == false
        warnings.enabled?(:nodoc, "", [:param, :public]).should == false
      end
    end

    describe ":no_doc_member warning" do
      before do
        warnings.set(:no_doc_member, true)
      end

      it "enables :nodoc warnings for public members" do
        warnings.enabled?(:nodoc, "", [:member, :public]).should == true
        warnings.enabled?(:nodoc, "", [:member, :private]).should == false
        warnings.enabled?(:nodoc, "", [:class, :public]).should == false
        warnings.enabled?(:nodoc, "", [:param, :public]).should == false
      end
    end

    describe ":no_doc_param warning" do
      before do
        warnings.set(:no_doc_param, true)
      end

      it "enables :nodoc warnings public params" do
        warnings.enabled?(:nodoc, "", [:param, :public]).should == true
        warnings.enabled?(:nodoc, "", [:param, :private]).should == false
        warnings.enabled?(:nodoc, "", [:member, :public]).should == false
        warnings.enabled?(:nodoc, "", [:class, :public]).should == false
      end
    end
  end

end
