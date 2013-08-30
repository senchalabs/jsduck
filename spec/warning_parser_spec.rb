require "jsduck/warning/parser"
require 'jsduck/warning/warn_exception'

describe JsDuck::Warning::Parser do
  def parse(s)
    JsDuck::Warning::Parser.new(s).parse
  end

  describe "parsing empty string" do
    it "results in empty array" do
      parse("").should == []
    end
  end

  describe "parsing +foo,bar_bar,-baz" do
    let(:warnings) { parse("+foo, bar_bar, -baz") }

    it "results in 3 warning defs" do
      warnings.length.should == 3
    end

    describe "first" do
      let(:w) { warnings[0] }

      it "is of type :foo" do
        w[:type].should == :foo
      end

      it "is enabled" do
        w[:enabled].should == true
      end
    end

    describe "second" do
      let(:w) { warnings[1] }

      it "is of type :bar_bar" do
        w[:type].should == :bar_bar
      end

      it "is enabled" do
        w[:enabled].should == true
      end
    end

    describe "third" do
      let(:w) { warnings[2] }

      it "is of type :baz" do
        w[:type].should == :baz
      end

      it "is disabled" do
        w[:enabled].should == false
      end
    end
  end

  describe "parsing foo:/some/path" do
    let(:w) { parse("foo:/some/path ")[0] }

    it "detects path" do
      w[:path].should == "/some/path"
    end
  end

  describe "parsing two warnings with path" do
    let(:warnings) { parse("foo:/some/path,bar:/other/path") }

    it "detects two warnings" do
      warnings.length.should == 2
    end
  end

  describe "parsing nodoc(class,public)" do
    let(:w) { parse("nodoc(class,public)")[0] }

    it "detects params" do
      w[:params].should == [:class, :public]
    end
  end

  describe "parsing nodoc(,private)" do
    let(:w) { parse("nodoc(,private)")[0] }

    it "detects also empty params" do
      w[:params].should == [nil, :private]
    end
  end

  describe "parsing invalid warning type" do
    it "raises an exception" do
      begin
        parse("?123")
      rescue JsDuck::Warning::WarnException => e
        e.message.should == "Unexpected '?' at --warnings='<HERE>?123'"
      end
    end
  end

  describe "parsing invalid stuff after warning type" do
    it "raises an exception" do
      begin
        parse("tag?123")
      rescue JsDuck::Warning::WarnException => e
        e.message.should == "Unexpected '?' at --warnings='tag<HERE>?123'"
      end
    end
  end

  describe "parsing invalid warning param" do
    it "raises an exception" do
      begin
        parse("nodoc(?)")
      rescue JsDuck::Warning::WarnException => e
        e.message.should == "Unexpected '?' at --warnings='nodoc(<HERE>?)'"
      end
    end
  end

  describe "parsing invalid stuff after warning param" do
    it "raises an exception" do
      begin
        parse("nodoc(foo?)")
      rescue JsDuck::Warning::WarnException => e
        e.message.should == "Unexpected '?' at --warnings='nodoc(foo<HERE>?)'"
      end
    end
  end

end
