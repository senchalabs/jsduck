require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.create_accessors
    agr.result
  end

  describe "@cfg foo with @accessor" do
    before do
      @docs = parse(<<-EOF)
        /** @class MyClass */
          /**
           * @cfg {String} foo
           * Original comment.
           * @accessor
           */
      EOF
      @methods = {}
      @docs[0][:members][:method].each do |m|
        @methods[m[:name]] = m
      end
    end

    it "creates getFoo method" do
      @methods.should have_key("getFoo")
    end

    it "sets getFoo return type to @cfg type" do
      @methods["getFoo"][:return][:type].should == "String"
    end

    it "sets getFoo to have 0 parameters" do
      @methods["getFoo"][:params].length.should == 0
    end

    it "sets getFoo owner @cfg owner" do
      @methods["getFoo"][:owner].should == "MyClass"
    end

    it "generates dummy docs for getFoo" do
      @methods["getFoo"][:doc].should == "Returns the value of {@link #cfg-foo}."
    end

    it "creates setFoo method" do
      @methods.should have_key("setFoo")
    end

    it "sets setFoo return type to undefined" do
      @methods["setFoo"][:return][:type].should == "undefined"
    end

    it "sets setFoo parameter type to @cfg type" do
      @methods["setFoo"][:params][0][:type].should == "String"
    end

    it "sets setFoo parameter name to @cfg name" do
      @methods["setFoo"][:params][0][:name].should == "foo"
    end

    it "sets setFoo owner @cfg owner" do
      @methods["setFoo"][:owner].should == "MyClass"
    end

    it "generates dummy docs for setFoo" do
      @methods["setFoo"][:doc].should == "Sets the value of {@link #cfg-foo}."
    end

  end

  describe "@accessor config" do
    before do
      @docs = parse(<<-EOF)
        /** @class MyClass */
          /**
           * @cfg {String} foo
           * Original comment.
           * @accessor
           */
          /**
           * @cfg {String} bar
           * Original comment.
           * @accessor
           */
          /**
           * @method getFoo
           * Custom comment.
           */
          /**
           * @method setBar
           * Custom comment.
           */
      EOF
      @methods = {}
      @docs[0][:members][:method].each do |m|
        @methods[m[:name]] = m
      end
    end

    it "doesn't create getter when method already present" do
      @methods["getFoo"][:doc].should == "Custom comment."
    end

    it "doesn't create setter when method already present" do
      @methods["setBar"][:doc].should == "Custom comment."
    end

    it "creates getter when method not present" do
      @methods.should have_key("getBar")
    end

    it "creates setter when method not present" do
      @methods.should have_key("setFoo")
    end

  end

end

