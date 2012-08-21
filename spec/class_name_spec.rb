require "jsduck/class_name"

describe "JsDuck::ClassName#short" do

  def short(name)
    JsDuck::ClassName.short(name)
  end

  it "returns only the last part of full name in normal case" do
    short("My.package.Cls").should == "Cls"
  end

  it "returns the whole name when it has no parts" do
    short("Foo").should == "Foo"
  end

  it "returns the second part when full_name has two uppercase parts" do
    short("Foo.Bar").should == "Bar"
  end

  it "returns two last parts when full name has three uppercase parts" do
    short("My.Package.Cls").should == "Package.Cls"
  end

end
