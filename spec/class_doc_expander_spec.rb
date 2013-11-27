require "jsduck/class_doc_expander"
require "mini_parser"

describe JsDuck::ClassDocExpander do
  def parse(string)
    Helper::MiniParser.parse(string)
  end

  describe "class with cfgs" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /**
         * @class MyClass
         * @extends Bar
         * Comment here.
         * @cfg {String} foo Hahaha
         * @private
         * @cfg {Boolean} bar Hihihi
         */
      EOS
    end

    it "has needed number of members" do
      cls[:members].length.should == 2
    end
    it "detects members as configs" do
      cls[:members][0][:tagname].should == :cfg
      cls[:members][1][:tagname].should == :cfg
    end
    it "picks up names of all configs" do
      cls[:members][0][:name].should == "foo"
      cls[:members][1][:name].should == "bar"
    end
    it "marks first @cfg as private" do
      cls[:members][0][:private].should == true
    end
  end

  describe "class with cfgs with subproperties" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /**
         * @class MyClass
         * Comment here.
         * @cfg {Object} foo
         * @cfg {String} foo.one
         * @cfg {String} foo.two
         * @cfg {Function} bar
         * @cfg {Boolean} bar.arg
         */
      EOS
    end

    it "detects the configs taking account the subproperties" do
      cls[:members].length.should == 2
    end
  end

  describe "class with parentless sub-cfg" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /**
         * @class MyClass
         * Comment here.
         * @cfg {String} foo.one
         */
      EOS
    end

    it "detects the one bogus config" do
      cls[:members].length.should == 1
    end
  end

  describe "implicit class with more than one cfg" do
    let(:cls) do
      parse(<<-EOS)["MyClass"]
        /**
         * Comment here.
         * @cfg {String} foo
         * @cfg {String} bar
         */
        MyClass = function() {}
      EOS
    end

    it "is detected as class" do
      cls[:tagname].should == :class
    end
  end

  describe "configs in class doc-comment and separately" do
    let(:cls) do
      parse(<<-EOS)["Foo"]
        /**
         * @class Foo
         * @cfg c1
         */
          /** @cfg c2 */
          /** @cfg c3 */
      EOS
    end

    it "get all combined into one members list" do
      cls[:members].length.should == 3
    end
  end

end
