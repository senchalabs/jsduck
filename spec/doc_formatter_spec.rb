# -*- coding: utf-8 -*-
require "jsduck/doc_formatter"
require "jsduck/relations"
require "jsduck/class"

describe JsDuck::DocFormatter do

  class ImageDirMock
    def get(filename)
      {:relative_path => filename}
    end
  end

  describe "#replace" do

    before do
      relations = JsDuck::Relations.new([
        JsDuck::Class.new({
          :name => "Context",
          :members => [
            {:tagname => :method, :name => "bar", :id => "method-bar"},
            {:tagname => :method, :name => "id", :id => "static-method-id",
              :meta => {:static => true}},
          ],
        }),
        JsDuck::Class.new({
          :name => 'Ext.Msg'
        }),
        JsDuck::Class.new({
          :name => "Foo",
          :members => [
            {:tagname => :cfg, :name => "bar", :id => "cfg-bar"},
            {:tagname => :method, :name => "id", :id => "static-method-id",
              :meta => {:static => true}},
            {:tagname => :method, :name => "privMeth", :id => "method-privMeth", :private => true},
          ],
          :alternateClassNames => ["FooBar"]
        }),
      ])
      @formatter = JsDuck::DocFormatter.new(relations, :img_tpl => '<img src="%u" alt="%a"/>')
      @formatter.class_context = "Context"
      @formatter.images = ImageDirMock.new
    end

    # {@link ...}

    it "replaces {@link Ext.Msg} with link to class" do
      @formatter.replace("Look at {@link Ext.Msg}").should ==
        'Look at <a href="Ext.Msg">Ext.Msg</a>'
    end

    it "replaces {@link Foo#bar} with link to class member" do
      @formatter.replace("Look at {@link Foo#bar}").should ==
        'Look at <a href="Foo#cfg-bar">Foo.bar</a>'
    end

    it "replaces {@link Foo#id} with link to static class member" do
      @formatter.replace("Look at {@link Foo#id}").should ==
        'Look at <a href="Foo#static-method-id">Foo.id</a>'
    end

    it "replaces {@link Foo#privMeth} with link to private class member" do
      @formatter.replace("Look at {@link Foo#privMeth}").should ==
        'Look at <a href="Foo#method-privMeth">Foo.privMeth</a>'
    end

    it "uses context to replace {@link #bar} with link to class member" do
      @formatter.replace("Look at {@link #bar}").should ==
        'Look at <a href="Context#method-bar">bar</a>'
    end

    it "uses context to replace {@link #id} with link to static class member" do
      @formatter.replace("Look at {@link #id}").should ==
        'Look at <a href="Context#static-method-id">id</a>'
    end

    it "allows use of custom link text" do
      @formatter.replace("Look at {@link Foo link text}").should ==
        'Look at <a href="Foo">link text</a>'
    end

    it "Links alternate classname to real classname" do
      @formatter.replace("Look at {@link FooBar}").should ==
        'Look at <a href="Foo">FooBar</a>'
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
        'Look at <a href="Ext.Msg">some text</a>'
    end

    it "handles {@link} with label spanning multiple lines" do
      @formatter.replace("Look at {@link Ext.Msg some\ntext}").should ==
        "Look at <a href=\"Ext.Msg\">some\ntext</a>"
    end

    it "escapes link text" do
      @formatter.replace('{@link Ext.Msg <bla>}').should ==
        '<a href="Ext.Msg">&lt;bla&gt;</a>'
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

    it "escapes image alt text" do
      @formatter.replace('{@img some/image.png foo"bar}').should ==
        '<img src="some/image.png" alt="foo&quot;bar"/>'
    end

    # {@video ...}

    it "replaces {@video html5 some/url.mpeg Alt text} with HTML5 video element" do
      @formatter.replace("{@video html5 some/url.mpeg Alt text}").should ==
        '<video src="some/url.mpeg">Alt text</video>'
    end

    it "replaces {@video vimeo 123456 Alt text} with Vimeo video markup" do
      @formatter.replace("{@video vimeo 123456 Alt text}").should =~
        /<iframe.*123456.*iframe>/
    end
  end

  # auto-conversion of identifiable ClassNames to links
  describe "#replace auto-detect" do
    before do
      relations = JsDuck::Relations.new([
        JsDuck::Class.new({:name => 'Foo.Bar'}),
        JsDuck::Class.new({:name => 'Foo.Bar.Blah'}),
        JsDuck::Class.new({
          :name => 'Ext.form.Field',
          :members => [
            {:tagname => :method, :name => "getValues", :id => "method-getValues"}
          ]
        }),
        JsDuck::Class.new({
          :name => 'Ext.XTemplate',
          :alternateClassNames => ['Ext.AltXTemplate']
        }),
        JsDuck::Class.new({
          :name => 'Ext',
          :members => [
            {:tagname => :method, :name => "encode", :id => "method-encode"}
          ]
        }),
        JsDuck::Class.new({
          :name => "Context",
          :members => [
            {:tagname => :method, :name => "bar", :id => "method-bar"},
            {:tagname => :method, :name => "privMeth", :id => "method-privMeth", :private => true},
          ]
        }),
        JsDuck::Class.new({
          :name => "downcase.ClassName",
          :members => [
            {:tagname => :method, :name => "blah", :id => "method-blah"},
          ]
        }),
        JsDuck::Class.new({
          :name => "_us.In_Cls_Name",
          :members => [
            {:tagname => :method, :name => "_sss", :id => "method-_sss"},
          ]
        }),
        JsDuck::Class.new({
          :name => "$Class",
          :members => [
            {:tagname => :method, :name => "$sss", :id => "method-S-sss"},
          ]
        }),
      ])
      @formatter = JsDuck::DocFormatter.new(relations, :img_tpl => '<img src="%u" alt="%a"/>')
      @formatter.class_context = "Context"
      @formatter.images = ImageDirMock.new
    end

    it "doesn't recognize John as class name" do
      @formatter.replace("John is lazy").should ==
        "John is lazy"
    end

    it "doesn't recognize Bla.Bla as class name" do
      @formatter.replace("Unknown Bla.Bla class").should ==
        "Unknown Bla.Bla class"
    end

    it "doesn't recognize Ext as class name" do
      @formatter.replace("Talking about Ext JS").should ==
        "Talking about Ext JS"
    end

    it "converts Foo.Bar to class link" do
      @formatter.replace("Look at Foo.Bar").should ==
        'Look at <a href="Foo.Bar">Foo.Bar</a>'
    end

    it "converts FooBar.Blah to class link" do
      @formatter.replace("Look at Foo.Bar.Blah").should ==
        'Look at <a href="Foo.Bar.Blah">Foo.Bar.Blah</a>'
    end

    it "converts Ext.form.Field to class link" do
      @formatter.replace("Look at Ext.form.Field").should ==
        'Look at <a href="Ext.form.Field">Ext.form.Field</a>'
    end

    it "converts Ext.XTemplate to class link" do
      @formatter.replace("Look at Ext.XTemplate").should ==
        'Look at <a href="Ext.XTemplate">Ext.XTemplate</a>'
    end

    it "links alternate classname to canonical classname" do
      @formatter.replace("Look at Ext.AltXTemplate").should ==
        'Look at <a href="Ext.XTemplate">Ext.AltXTemplate</a>'
    end

    it "converts downcase.ClassName to class link" do
      @formatter.replace("Look at downcase.ClassName").should ==
        'Look at <a href="downcase.ClassName">downcase.ClassName</a>'
    end

    it "converts classname with underscores to class link" do
      @formatter.replace("Look at _us.In_Cls_Name").should ==
        'Look at <a href="_us.In_Cls_Name">_us.In_Cls_Name</a>'
    end

    it "converts ClassName ending with dot to class link" do
      @formatter.replace("Look at Foo.Bar.").should ==
        'Look at <a href="Foo.Bar">Foo.Bar</a>.'
    end

    it "converts ClassName ending with comma to class link" do
      @formatter.replace("Look at Foo.Bar, it's great!").should ==
        'Look at <a href="Foo.Bar">Foo.Bar</a>, it\'s great!'
    end

    it "converts two ClassNames in one line to links" do
      @formatter.replace("See: Foo.Bar, Ext.XTemplate").should ==
        'See: <a href="Foo.Bar">Foo.Bar</a>, <a href="Ext.XTemplate">Ext.XTemplate</a>'
    end

    # Links to #members

    it "converts Ext#encode to method link" do
      @formatter.replace("Look at Ext#encode").should ==
        'Look at <a href="Ext#method-encode">Ext.encode</a>'
    end

    it "converts Ext.form.Field#getValues to method link" do
      @formatter.replace("Look at Ext.form.Field#getValues").should ==
        'Look at <a href="Ext.form.Field#method-getValues">Ext.form.Field.getValues</a>'
    end

    it "converts downcase.ClassName#blah to method link" do
      @formatter.replace("Look at downcase.ClassName#blah").should ==
        'Look at <a href="downcase.ClassName#method-blah">downcase.ClassName.blah</a>'
    end

    it 'converts $Class#$sss to method link' do
      @formatter.replace('Look at $Class#$sss').should ==
        'Look at <a href="$Class#method-S-sss">$Class.$sss</a>'
    end

    it "converts Ext.encode to method link" do
      @formatter.replace("Look at Ext.encode").should ==
        'Look at <a href="Ext#method-encode">Ext.encode</a>'
    end

    it "converts #bar to link to current class method" do
      @formatter.replace("Look at #bar method").should ==
        'Look at <a href="Context#method-bar">bar</a> method'
    end

    it "converts #privMeth to link to private method" do
      @formatter.replace("Look at #privMeth method").should ==
        'Look at <a href="Context#method-privMeth">privMeth</a> method'
    end

    it "Doesn't convert #unknown to link" do
      @formatter.replace("Ahh, an #unknown method").should ==
        'Ahh, an #unknown method'
    end

    # Ensure links aren't created inside <a>...</a> or {@link} and {@img} tags.

    it "doesn't create links inside {@link} tag" do
      @formatter.replace("{@link Foo.Bar a Foo.Bar link}").should ==
        '<a href="Foo.Bar">a Foo.Bar link</a>'
    end

    it "doesn't create links inside {@img} tag" do
      @formatter.replace("{@img some/file.jpg a Foo.Bar image}").should ==
        '<img src="some/file.jpg" alt="a Foo.Bar image"/>'
    end

    it "doesn't create links inside HTML tags" do
      @formatter.replace('<img src="pics/Foo.Bar"/>').should ==
        '<img src="pics/Foo.Bar"/>'
    end

    it "doesn't create links inside multiline HTML tags" do
      @formatter.replace('<img\nsrc="pics/Foo.Bar"/>').should ==
        '<img\nsrc="pics/Foo.Bar"/>'
    end

    it "doesn't create links inside <a>...</a>" do
      @formatter.replace('See <a href="Foo.Bar">Foo.Bar</a>').should ==
        'See <a href="Foo.Bar">Foo.Bar</a>'
    end

    it "creates links inside <b>...</b>" do
      @formatter.replace('See <b>Foo.Bar</b>').should ==
        'See <b><a href="Foo.Bar">Foo.Bar</a></b>'
    end

    it "doesn't create links inside <a><b>...</b></a>" do
      @formatter.replace('See <a href="Foo.Bar"><b>Foo.Bar</b></a>').should ==
        'See <a href="Foo.Bar"><b>Foo.Bar</b></a>'
    end

    it "creates links after <a>...</a>" do
      @formatter.replace('See <a href="Foo.Bar">Foo.Bar</a> and Ext.XTemplate.').should ==
        'See <a href="Foo.Bar">Foo.Bar</a> and <a href="Ext.XTemplate">Ext.XTemplate</a>.'
    end

    it "doesn't create links inside nested <a> tags" do
      @formatter.replace('See <a href="Foo.Bar"><a>Foo.Bar</a> Ext.XTemplate</a>').should ==
        'See <a href="Foo.Bar"><a>Foo.Bar</a> Ext.XTemplate</a>'
    end

    it "handles unclosed HTML tags" do
      @formatter.replace('Malformed <img').should ==
        'Malformed <img'
    end

  end

  describe "#replace with type information" do
    before do
      relations = JsDuck::Relations.new([
        JsDuck::Class.new({
          :name => 'Foo',
          :members => [
            {:tagname => :method, :name => "select", :id => "method-select"},
            {:tagname => :event, :name => "select", :id => "event-select"},
          ]
        })
      ])
      @formatter = JsDuck::DocFormatter.new(relations)
    end

    it "replaces {@link Foo#method-select} with link to method" do
      @formatter.replace("Look at {@link Foo#method-select}").should ==
        'Look at <a href="Foo#method-select">Foo.select</a>'
    end

    it "replaces {@link Foo#event-select} with link to event" do
      @formatter.replace("Look at {@link Foo#event-select}").should ==
        'Look at <a href="Foo#event-select">Foo.select</a>'
    end
  end

  describe "#replace with staticality information" do
    before do
      relations = JsDuck::Relations.new([
        JsDuck::Class.new({
          :name => 'Foo',
          :members => [
            {:tagname => :method, :name => "select", :id => "method-select", :meta => {}},
            {:tagname => :method, :name => "select", :id => "static-method-select",
              :meta => {:static => true}},
          ]
        })
      ])
      @formatter = JsDuck::DocFormatter.new(relations)
    end

    it "replaces {@link Foo#select} with link to instance method" do
      @formatter.replace("Look at {@link Foo#select}").should ==
        'Look at <a href="Foo#method-select">Foo.select</a>'
    end

    it "replaces {@link Foo#static-select} with link to static method" do
      @formatter.replace("Look at {@link Foo#static-select}").should ==
        'Look at <a href="Foo#static-method-select">Foo.select</a>'
    end

    it "replaces {@link Foo#static-method-select} with link to static method" do
      @formatter.replace("Look at {@link Foo#static-method-select}").should ==
        'Look at <a href="Foo#static-method-select">Foo.select</a>'
    end
  end

  describe "#format" do
    before do
      @formatter = JsDuck::DocFormatter.new
    end

    # Just a sanity check that Markdown formatting works
    it "converts Markdown to HTML" do
      @formatter.format("Hello **world**").should =~ /Hello <strong>world<\/strong>/
    end

    it "closes unclosed <b> tags" do
      @formatter.format("<b>Hello").should =~ /<b>Hello.*<\/b>/m
    end

    it "closes unclosed <a> and <b> in correct order" do
      @formatter.format("<a><b>Hello").should =~ /<\/b><\/a>/
    end

    it "doesn't close unclosed <img> tags" do
      @formatter.format("<img>").should_not =~ /<\/img>/
    end

    it "closes unclosed <b> when closing of <a> is encountered." do
      @formatter.format("<a><b>blah</a>").should =~ Regexp.new("</b></a>")
    end

    it "throws away excessive close tags" do
      @formatter.format("blah</div>").should_not =~ Regexp.new("</div>")
    end

    it "allows for p-s nested inside divs" do
      @formatter.format("<div><small><p>Blah</p><p>Fah</p></small></div>").should =~
             Regexp.new("<div><small><p>Blah</p><p>Fah</p></small></div>")
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

    describe "quoted `<pre>`" do
      before do
        @html = @formatter.format("Some `<pre>` in here.")
      end

      it "is correctly escaped" do
        @html.should == "<p>Some <code>&lt;pre&gt;</code> in here.</p>\n"
      end
    end

    describe "quoted `<pre><code>`" do
      before do
        @html = @formatter.format("Some `<pre><code>` in here.")
      end

      it "is correctly escaped" do
        @html.should == "<p>Some <code>&lt;pre&gt;&lt;code&gt;</code> in here.</p>\n"
      end
    end

    shared_examples_for "example" do
      it "creates <pre> with inline-example class" do
        @html.should =~ /<pre class='inline-example *'>/m
      end

      it "removes the line with @example markup" do
        @html.should_not =~ /@example/m
      end

      it "completely removes the first line and whitespace after it" do
        @html.should =~ /code>if/m
      end
    end

    describe "code block beginning with @example" do
      before do
        @html = @formatter.format(<<-EOS.gsub(/^ *\|/, ""))
          |See example:
          |
          |    @example
          |    if (condition) {
          |        doSomething();
          |    }
        EOS
      end
      it_should_behave_like "example"
    end

    describe "code block beginning with @example and an extra CSS class" do
      before do
        @html = @formatter.format(<<-EOS.gsub(/^ *\|/, ""))
          |See example:
          |
          |    @example landscape
          |
          |    if (condition) {
          |        doSomething();
          |    }
        EOS
      end
      it "creates <pre> with inline-example and extra class" do
        @html.should =~ /<pre class='inline-example landscape'>/m
      end
    end

    describe "@example code block indented more than 4 spaces" do
      before do
        @html = @formatter.format(<<-EOS.gsub(/^ *\|/, ""))
          |See example:
          |
          |      @example
          |      if (condition) {
          |          doSomething();
          |      }
        EOS
      end
      it_should_behave_like "example"
    end

  end

end
