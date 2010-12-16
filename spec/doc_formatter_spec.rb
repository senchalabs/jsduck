require "jsduck/doc_formatter"

describe JsDuck::DocFormatter do

  before do
    @formatter = JsDuck::DocFormatter.new("Context")
  end

  describe "#replace" do

    it "replaces {@link Ext.Msg} with link to class" do
      @formatter.replace("Look at {@link Ext.Msg}").should ==
        'Look at <a href="output/Ext.Msg.html" ext:cls="Ext.Msg">Ext.Msg</a>'
    end

    it "replaces {@link Foo#bar} with link to class member" do
      @formatter.replace("Look at {@link Foo#bar}").should ==
        'Look at <a href="output/Foo.html#Foo-bar" ext:cls="Foo" ext:member="bar">Foo.bar</a>'
    end

    it "uses context to replace {@link #bar} with link to class member" do
      @formatter.replace("Look at {@link #bar}").should ==
        'Look at <a href="output/Context.html#Context-bar" ext:cls="Context" ext:member="bar">bar</a>'
    end

    it "allows use of custom link text" do
      @formatter.replace("Look at {@link Foo link text}").should ==
        'Look at <a href="output/Foo.html" ext:cls="Foo">link text</a>'
    end

    it "leaves text without {@link...} untouched" do
      @formatter.replace("Look at {@me here} too").should ==
        'Look at {@me here} too'
    end

    it "ignores unfinished {@link tag" do
      @formatter.replace("unfinished {@link tag here").should ==
        'unfinished {@link tag here'
    end
  end

  describe "#format" do

    # Just a sanity check that Markdown formatting works
    it "converts Markdown to HTML" do
      @formatter.format("Hello **world**").should =~ /Hello <strong>world<\/strong>/
    end

    it "does not create nested <pre> segments" do
      html = @formatter.format("
Some code<pre><code>
if (condition) {
    doSomething();
}
</code></pre>
")
      html.should_not =~ /<pre>.*<pre>/m
    end
  end

end
