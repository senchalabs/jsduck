require "jsduck/js_literal_builder"

describe JsDuck::JsLiteralBuilder do

  def build(obj)
    JsDuck::JsLiteralBuilder.new.to_s(obj)
  end

  it "builds number" do
    build({:type => :number, :value => "5"}).should == "5"
  end

  it "builds string" do
    build({:type => :string, :value => "5"}).should == '"5"'
  end

  it "builds regex" do
    build({:type => :regex, :value => "/[a-z]/i"}).should == '/[a-z]/i'
  end

  it "builds array" do
    build({:type => :array, :value => [
          {:type => :number, :value => "1"},
          {:type => :number, :value => "2"}
        ]}).should == '[1, 2]'
  end

  it "parses object" do
    build({:type => :object, :value => [
          {:key => {:type => :ident, :value => "foo"}, :value => {:type => :number, :value => "1"}},
          {:key => {:type => :string, :value => "bar"}, :value => {:type => :number, :value => "2"}}
        ]}).should == '{foo: 1, "bar": 2}'
  end

end

