require "jsduck/inline_examples"
require "jsduck/doc_formatter"

describe JsDuck::InlineExamples do

  def extract(doc)
    html = JsDuck::DocFormatter.new.format(doc)
    JsDuck::InlineExamples.new([]).extract(html)
  end

  it "finds no examples from empty string" do
    extract("").should == []
  end

  it "finds no examples from simple text" do
    extract("bla bla bla").should == []
  end

  it "finds no examples from code blocks without @example tag" do
    extract(<<-EOS).should == []
Here's some code:

    My code

    EOS
  end

  it "finds one single-line example" do
    extract(<<-EOS).should == ["My code\n"]
    @example
    My code
    EOS
  end

  it "finds one multi-line example" do
    extract(<<-EOS).should == ["My code\n\nMore code\n"]
    @example
    My code

    More code
    EOS
  end

  it "finds two examples" do
    extract(<<-EOS).should == ["My code 1\n", "My code 2\n"]
First example:

    @example
    My code 1

And another...

    @example
    My code 2
    EOS
  end

  it "preserves HTML inside example" do
    extract(<<-EOS).should == ["document.write('<b>Hello</b>');\n"]
    @example
    document.write('<b>Hello</b>');
    EOS
  end

  it "ignores links inside examples" do
    JsDuck::InlineExamples.new([]).extract(<<-EOS).should == ["Ext.define();\n"]
<pre class='inline-example '><code><a href="#!/api/Ext">Ext</a>.define();
</code></pre>
EOS
  end

end
