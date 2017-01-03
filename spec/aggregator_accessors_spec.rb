require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
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
      @members = {}
      @docs[0][:members].each do |m|
        @members[m[:name]] = m
      end
    end

    it "creates getFoo method" do
      @members.should have_key("getFoo")
    end

    it "sets getFoo return type to @cfg type" do
      @members["getFoo"][:return][:type].should == "String"
    end

    it "sets getFoo to have 0 parameters" do
      @members["getFoo"][:params].length.should == 0
    end

    it "sets getFoo owner @cfg owner" do
      @members["getFoo"][:owner].should == "MyClass"
    end

    it "generates dummy docs for getFoo" do
      @members["getFoo"][:doc].should == "Returns the value of {@link #cfg-foo}."
    end

    it "creates setFoo method" do
      @members.should have_key("setFoo")
    end

    it "sets setFoo return type to undefined" do
      @members["setFoo"][:return][:type].should == "undefined"
    end

    it "sets setFoo parameter type to @cfg type" do
      @members["setFoo"][:params][0][:type].should == "String"
    end

    it "sets setFoo parameter name to @cfg name" do
      @members["setFoo"][:params][0][:name].should == "foo"
    end

    it "sets setFoo owner @cfg owner" do
      @members["setFoo"][:owner].should == "MyClass"
    end

    it "generates dummy docs for setFoo" do
      @members["setFoo"][:doc].should == "Sets the value of {@link #cfg-foo}."
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
      @members = {}
      @docs[0][:members].each do |m|
        @members[m[:name]] = m
      end
    end

    it "doesn't create getter when method already present" do
      @members["getFoo"][:doc].should == "Custom comment."
    end

    it "doesn't create setter when method already present" do
      @members["setBar"][:doc].should == "Custom comment."
    end

    it "creates getter when method not present" do
      @members.should have_key("getBar")
    end

    it "creates setter when method not present" do
      @members.should have_key("setFoo")
    end

  end

  describe "@accessor tag on private cfg" do
    before do
      @docs = parse(<<-EOF)
        /** @class MyClass */
          /**
           * @cfg {String} foo
           * @private
           * @accessor
           * @evented
           */
      EOF
      @accessors = @docs[0][:members].find_all {|m| m[:tagname] == :method }
      @events = @docs[0][:members].find_all {|m| m[:tagname] == :event }
    end

    it "creates accessors" do
      @accessors.length.should == 2
    end

    it "creates private getter" do
      @accessors[0][:private].should == true
    end

    it "creates private setter" do
      @accessors[1][:private].should == true
    end

    it "creates private event" do
      @events[0][:private].should == true
    end
  end

  describe "@cfg foo with @evented @accessor" do
    before do
      @docs = parse(<<-EOF)
        /** @class MyClass */
          /**
           * @cfg {String} foo
           * Original comment.
           * @accessor
           * @evented
           */
      EOF
      @events = @docs[0][:members].find_all {|m| m[:tagname] == :event }
    end

    it "creates foochange event" do
      @events[0][:name].should == "foochange"
    end

    it "creates documentation for foochange event" do
      @events[0][:doc].should ==
        "Fires when the {@link #cfg-foo} configuration is changed by {@link #method-setFoo}."
    end

    it "has 3 params" do
      @events[0][:params].length.should == 3
    end

    describe "1st param" do
      before do
        @param = @events[0][:params][0]
      end

      it "is this" do
        @param[:name].should == "this"
      end

      it "is the same type as the class" do
        @param[:type].should == "MyClass"
      end

      it "has documentation" do
        @param[:doc].should == "The MyClass instance."
      end
    end

    describe "2nd param" do
      before do
        @param = @events[0][:params][1]
      end

      it "is value" do
        @param[:name].should == "value"
      end

      it "is the same type as the cfg" do
        @param[:type].should == "String"
      end

      it "has documentation" do
        @param[:doc].should == "The new value being set."
      end
    end

    describe "3rd param" do
      before do
        @param = @events[0][:params][2]
      end

      it "is oldValue" do
        @param[:name].should == "oldValue"
      end

      it "is the same type as the cfg" do
        @param[:type].should == "String"
      end

      it "has documentation" do
        @param[:doc].should == "The existing value."
      end
    end

  end

  describe "@evented @accessor with existing event" do
    before do
      @docs = parse(<<-EOF)
        /** @class MyClass */
          /**
           * @cfg {String} fooBar
           * @accessor
           * @evented
           */
          /**
           * @event foobarchange
           * Event comment.
           */
      EOF
      @events = @docs[0][:members].find_all {|m| m[:tagname] == :event }
    end

    it "doesn't create any additional events" do
      @events.length.should == 1
    end

    it "leaves the existing event as is." do
      @events[0][:doc].should == "Event comment."
    end
  end

end

