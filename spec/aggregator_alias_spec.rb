require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do

  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.populate_aliases
    agr.result
  end

  shared_examples_for "@alias" do
    it "original method keeps its name" do
      @orig[:name].should == "bar"
    end

    it "alias keeps its name" do
      @alias[:name].should == "foobar"
    end

    it "alias merges comment from original and its own comment" do
      @alias[:doc].should == "Alias comment.\n\nOriginal comment."
    end
  end

  describe "@alias of method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
           */

        /** @class Core */
          /**
           * @method foobar
           * Alias comment.
           * @alias Foo#bar
           */
      EOF
      @orig = @docs[0][:members][:method][0]
      @alias = @docs[1][:members][:method][0]
    end

    it_behaves_like "@alias"

    it "alias inherits parameters" do
      @alias[:params].length.should == 2
    end

    it "alias inherits return value" do
      @alias[:return][:type].should == "String"
    end
  end

  describe "@alias of event" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @event bar
           * Original comment.
           * @param arg1
           * @param arg2
           */

        /** @class Core */
          /**
           * @event foobar
           * Alias comment.
           * @alias Foo#bar
           */
      EOF
      @orig = @docs[0][:members][:event][0]
      @alias = @docs[1][:members][:event][0]
    end

    it_behaves_like "@alias"

    it "alias inherits parameters" do
      @alias[:params].length.should == 2
    end

    it "alias doesn't get return value" do
      @alias[:return].should == nil
    end
  end

  describe "@alias of cfg" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @cfg bar
           * Original comment.
           */

        /** @class Core */
          /**
           * @cfg foobar
           * Alias comment.
           * @alias Foo#bar
           */
      EOF
      @orig = @docs[0][:members][:cfg][0]
      @alias = @docs[1][:members][:cfg][0]
    end

    it_behaves_like "@alias"

    it "alias doesn't get parameters" do
      @alias[:params].should == nil
    end

    it "alias doesn't get return value" do
      @alias[:return].should == nil
    end
  end

  describe "@alias of static method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @static
           */

        /** @class Core */
          /**
           * @method foobar
           * Alias comment.
           * @alias Foo#bar
           * @static
           */
      EOF
      @orig = @docs[0][:statics][:method][0]
      @alias = @docs[1][:statics][:method][0]
    end

    it_behaves_like "@alias"
  end

end

