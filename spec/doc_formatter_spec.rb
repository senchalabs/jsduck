require "jsduck/doc_formatter"

class String
  # Removes beginning-whitespace from each line of a string.
  # But only as many whitespace as the first line has.
  #
  # Ment to be used with heredoc strings like so:
  #
  # text = <<-EOS.heredoc
  #   This line has no indentation
  #     This line has 2 spaces of indentation
  #   This line is also not indented
  # EOS
  #
  def unindent
    lines = []
    each_line {|ln| lines << ln }

    first_line_ws = lines[0].match(/^\s+/)[0]
    re = Regexp.new('^\s{0,' + first_line_ws.length.to_s + '}')

    lines.collect {|line| line.sub(re, "") }.join
  end
end

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

    shared_examples_for "code blocks" do
      it "contains text before" do
        @html.should =~ /Some code/
      end

      it "contains the code" do
        @html.include?("if (condition) {\n    doSomething();\n}").should == true
      end

      it "does not create nested <pre> segments" do
        @html.should_not =~ /<pre>.*<pre>/m
      end
    end

    describe "<pre>" do
      before do
        @html = @formatter.format(<<-EOS.unindent)
          Some code<pre>
          if (condition) {
              doSomething();
          }
          </pre>
        EOS
      end

      it_should_behave_like "code blocks"

      it "avoids newline after <pre>" do
        @html.should_not =~ /<pre>\n/m
      end
    end

    describe "<pre><code>" do
      before do
        @html = @formatter.format(<<-EOS.unindent)
          Some code<pre><code>
          if (condition) {
              doSomething();
          }
          </code></pre>
        EOS
      end

      it_should_behave_like "code blocks"

      it "avoids newline after <pre><code>" do
        @html.should_not =~ /<pre><code>\n/m
      end
    end

  end

end
