require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.result
  end

  describe "normal @static on single method" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @static
         */
        function bar() {}
      EOS
    end

    it "labels that method as static" do
      @doc[:meta][:static].should == true
    end

    it "doesn't detect inheritable property" do
      @doc[:inheritable].should_not == true
    end
  end

  describe "@static with @inheritable" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * Some function
         * @static
         * @inheritable
         */
        function bar() {}
      EOS
    end

    it "labels that method as static" do
      @doc[:meta][:static].should == true
    end

    it "detects the @inheritable property" do
      @doc[:inheritable].should == true
    end
  end

  describe "@static in class context" do
    before do
      @doc = parse(<<-EOS)[0]
        /**
         * @class Foo
         */
        /**
         * Some function
         * @static
         */
        function bar() {}
        /**
         * Some property
         * @static
         */
        baz = "haha"
      EOS
    end

    it "adds method to statics" do
      @doc[:statics][:method][0][:name].should == "bar"
    end

    it "adds property to statics" do
      @doc[:statics][:property][0][:name].should == "baz"
    end
  end

  describe "Ext.define() with undocumented property in statics:" do
    let(:statics) do
      parse(<<-EOS)[0][:statics]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            statics: {
                foo: 42
            }
        });
      EOS
    end

    it "auto-detects one static property" do
      statics[:property].length.should == 1
    end

    describe "auto-detects static property" do
      let(:property) { statics[:property][0] }

      it "with :static flag" do
        property[:meta][:static].should == true
      end

      it "with :autodetected flag" do
        property[:autodetected].should == true
      end

      it "with owner" do
        property[:owner].should == "MyClass"
      end

      it "as private" do
        property[:private].should == true
      end

      it "with :linenr field" do
        property[:linenr].should == 6
      end
    end
  end

  describe "Ext.define() with documented method in statics:" do
    let(:statics) do
      parse(<<-EOS)[0][:statics]
        /**
         * Some documentation.
         */
        Ext.define("MyClass", {
            statics: {
                /** Docs for bar */
                bar: function() {}
            }
        });
      EOS
    end

    it "detects one static method" do
      statics[:method].length.should == 1
    end

    describe "detects static method" do
      let(:method) { statics[:method][0] }

      it "with :static flag" do
        method[:meta][:static].should == true
      end

      it "with docs" do
        method[:doc].should == "Docs for bar"
      end

      it "with owner" do
        method[:owner].should == "MyClass"
      end

      it "as public" do
        method[:private].should_not == true
      end

      it "with :linenr field" do
        method[:linenr].should == 6
      end
    end
  end

end
