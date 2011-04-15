require "jsduck/doc_formatter"

describe JsDuck::DocFormatter do

  before do
    @formatter = JsDuck::DocFormatter.new
    @formatter.context = "Context"
  end

  describe "#replace" do

    # {@link ...}

    it "replaces {@link Ext.Msg} with link to class" do
      @formatter.replace("Look at {@link Ext.Msg}").should ==
        'Look at <a href="Ext.Msg" rel="Ext.Msg">Ext.Msg</a>'
    end

    it "replaces {@link Foo#bar} with link to class member" do
      @formatter.replace("Look at {@link Foo#bar}").should ==
        'Look at <a href="Foo#bar" rel="Foo#bar">Foo.bar</a>'
    end

    it "uses context to replace {@link #bar} with link to class member" do
      @formatter.replace("Look at {@link #bar}").should ==
        'Look at <a href="Context#bar" rel="Context#bar">bar</a>'
    end

    it "allows use of custom link text" do
      @formatter.replace("Look at {@link Foo link text}").should ==
        'Look at <a href="Foo" rel="Foo">link text</a>'
    end

    it "leaves text without {@link...} untouched" do
      @formatter.replace("Look at {@me here} too").should ==
        'Look at {@me here} too'
    end

    it "ignores unfinished {@link tag" do
      @formatter.replace("unfinished {@link tag here").should ==
        'unfinished {@link tag here'
    end

    it "handles {@link} spanning multiple lines" do
      @formatter.replace("Look at {@link\nExt.Msg\nsome text}").should ==
        'Look at <a href="Ext.Msg" rel="Ext.Msg">some text</a>'
    end

    it "handles {@link} with label spanning multiple lines" do
      @formatter.replace("Look at {@link Ext.Msg some\ntext}").should ==
        "Look at <a href=\"Ext.Msg\" rel=\"Ext.Msg\">some\ntext</a>"
    end

    # {@img ...}

    it "replaces {@img some/image.png Alt text} with <img> element" do
      @formatter.replace("Look at {@img some/image.png Alt text}").should ==
        'Look at <img src="some/image.png" alt="Alt text"/>'
    end

    it "replaces {@img some/image.png} with <img> element with empty alt tag" do
      @formatter.replace("Look at {@img some/image.png}").should ==
        'Look at <img src="some/image.png" alt=""/>'
    end

    # auto-conversion of identifiable ClassNames to links
    describe "auto-detect" do
      before do
        @formatter.relations = {
          'FooBar' => true,
          'FooBar.Blah' => true,
          'Ext.form.Field' => true,
          'Ext.XTemplate' => true,
          'MyClass' => true,
          'Ext' => true,
        }
      end

      it "doesn't recognize John as class name" do
        @formatter.replace("John is lazy").should ==
          "John is lazy"
      end

      it "doesn't recognize Foo.Bar as class name" do
        @formatter.replace("Unknown Foo.Bar class").should ==
          "Unknown Foo.Bar class"
      end

      it "converts FooBar to class link" do
        @formatter.replace("Look at FooBar").should ==
          "Look at <a href=\"FooBar\" rel=\"FooBar\">FooBar</a>"
      end

      it "converts FooBar.Blah to class link" do
        @formatter.replace("Look at FooBar.Blah").should ==
          "Look at <a href=\"FooBar.Blah\" rel=\"FooBar.Blah\">FooBar.Blah</a>"
      end

      it "converts Ext.form.Field to class link" do
        @formatter.replace("Look at Ext.form.Field").should ==
          "Look at <a href=\"Ext.form.Field\" rel=\"Ext.form.Field\">Ext.form.Field</a>"
      end

      it "converts Ext.XTemplate to class link" do
        @formatter.replace("Look at Ext.XTemplate").should ==
          "Look at <a href=\"Ext.XTemplate\" rel=\"Ext.XTemplate\">Ext.XTemplate</a>"
      end

      it "converts ClassName ending with dot to class link" do
        @formatter.replace("Look at MyClass.").should ==
          "Look at <a href=\"MyClass\" rel=\"MyClass\">MyClass</a>."
      end

      it "converts ClassName ending with comma to class link" do
        @formatter.replace("Look at MyClass, it's great!").should ==
          "Look at <a href=\"MyClass\" rel=\"MyClass\">MyClass</a>, it's great!"
      end

      it "converts Ext#encode to method link" do
        @formatter.replace("Look at Ext#encode").should ==
          "Look at <a href=\"Ext#encode\" rel=\"Ext#encode\">Ext.encode</a>"
      end

      it "converts Ext.form.Field#getValues to method link" do
        @formatter.replace("Look at Ext.form.Field#getValues").should ==
          "Look at <a href=\"Ext.form.Field#getValues\" rel=\"Ext.form.Field#getValues\">Ext.form.Field.getValues</a>"
      end
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
        @html = @formatter.format(<<-EOS.gsub(/^ *\|/, ""))
          |Some code<pre>
          |if (condition) {
          |    doSomething();
          |}
          |</pre>
        EOS
      end

      it_should_behave_like "code blocks"

      it "avoids newline after <pre>" do
        @html.should_not =~ /<pre>\n/m
      end
    end

    describe "<pre><code>" do
      before do
        @html = @formatter.format(<<-EOS.gsub(/^ *\|/, ""))
          |Some code<pre><code>
          |if (condition) {
          |    doSomething();
          |}
          |</code></pre>
        EOS
      end

      it_should_behave_like "code blocks"

      it "avoids newline after <pre><code>" do
        @html.should_not =~ /<pre><code>\n/m
      end
    end

  end

  describe "#shorten" do

    before do
      @formatter.max_length = 10
    end

    it "leaves short text unchanged" do
      @formatter.shorten("Ha ha").should == "Ha ha"
    end

    it "leaves text with max length unchanged" do
      @formatter.shorten("1234567890").should == "1234567890"
    end

    it "shortens text longer than max length" do
      @formatter.shorten("12345678901").should == "1234567..."
    end

    it "ignores HTML tags when calculating text length" do
      @formatter.shorten("<a href='some-long-link'>Foo</a>").should == "<a href='some-long-link'>Foo</a>"
    end

    it "strips HTML tags when shortening" do
      @formatter.shorten("<a href='some-long-link'>12345678901</a>").should == "1234567..."
    end
  end

end
