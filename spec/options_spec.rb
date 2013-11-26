require "jsduck/options/parser"
require "jsduck/util/null_object"

describe JsDuck::Options::Parser do
  before :all do
    file_class = JsDuck::Util::NullObject.new({
        :dirname => Proc.new {|x| x },
        :expand_path => Proc.new {|x, pwd| x },
        :exists? => false,
      })
    @parser = JsDuck::Options::Parser.new(file_class)
  end

  def parse(*argv)
    @parser.parse(argv)
  end

  describe :input_files do
    it "defaults to empty array" do
      parse("-o", "foo/").input_files.should == []
    end

    it "treats empty input files list as invalid" do
      parse("-o", "foo/").validate!(:input_files).should_not == nil
    end

    it "contains all non-option arguments" do
      parse("foo.js", "bar.js").input_files.should == ["foo.js", "bar.js"]
    end

    it "is populated by --builtin-classes" do
      parse("--builtin-classes").input_files[0].should =~ /js-classes$/
    end

    it "is valid when populated by --builtin-classes" do
      parse("--builtin-classes").validate!(:input_files).should == nil
    end
  end

  describe :export do
    it "accepts --export=full" do
      opts = parse("--export", "full")
      opts.validate!(:export).should == nil
      opts.export.should == :full
    end

    it "accepts --export=examples" do
      opts = parse("--export", "examples")
      opts.validate!(:export).should == nil
      opts.export.should == :examples
    end

    it "doesn't accept --export=foo" do
      opts = parse("--export", "foo")
      opts.validate!(:export).should_not == nil
    end

    it "is valid when no export option specified" do
      opts = parse()
      opts.validate!(:export).should == nil
    end
  end

  describe :guides_toc_level do
    it "defaults to 2" do
      parse().guides_toc_level.should == 2
    end

    it "gets converted to integer" do
      parse("--guides-toc-level", "6").guides_toc_level.should == 6
    end

    it "is valid when between 1..6" do
      opts = parse("--guides-toc-level", "1")
      opts.validate!(:guides_toc_level).should == nil
    end

    it "is invalid when not a number" do
      opts = parse("--guides-toc-level", "hello")
      opts.validate!(:guides_toc_level).should_not == nil
    end

    it "is invalid when larger then 6" do
      opts = parse("--guides-toc-level", "7")
      opts.validate!(:guides_toc_level).should_not == nil
    end
  end

  describe :processes do
    it "defaults to nil" do
      opts = parse()
      opts.validate!(:processes).should == nil
      opts.processes.should == nil
    end

    it "can be set to 0" do
      opts = parse("--processes", "0")
      opts.validate!(:processes).should == nil
      opts.processes.should == 0
    end

    it "can be set to any positive number" do
      opts = parse("--processes", "4")
      opts.validate!(:processes).should == nil
      opts.processes.should == 4
    end

    it "can not be set to a negative number" do
      opts = parse("--processes", "-6")
      opts.validate!(:processes).should_not == nil
    end
  end

  describe :import do
    it "defaults to empty array" do
      parse().import.should == []
    end

    it "expands into version and path components" do
      parse("--import", "1.0:/vers/1", "--import", "2.0:/vers/2").import.should == [
        {:version => "1.0", :path => "/vers/1"},
        {:version => "2.0", :path => "/vers/2"},
      ]
    end

    it "expands pathless version number into just :version" do
      parse("--import", "3.0").import.should == [
        {:version => "3.0"},
      ]
    end
  end

  describe :ext_namespaces do
    it "defaults to nil" do
      parse().ext_namespaces.should == nil
    end

    it "can be used with comma-separated list" do
      parse("--ext-namespaces", "Foo,Bar").ext_namespaces.should == ["Foo", "Bar"]
    end

    it "can not be used multiple times" do
      parse("--ext-namespaces", "Foo", "--ext-namespaces", "Bar").ext_namespaces.should == ["Bar"]
    end
  end

  describe :ignore_html do
    it "defaults to empty hash" do
      parse().ignore_html.should == {}
    end

    it "can be used with comma-separated list" do
      html = parse("--ignore-html", "em,strong").ignore_html
      html.should include("em")
      html.should include("strong")
    end

    it "can be used multiple times" do
      html = parse("--ignore-html", "em", "--ignore-html", "strong").ignore_html
      html.should include("em")
      html.should include("strong")
    end
  end

  describe "--debug" do
    it "is equivalent of --template=template --template-links" do
      opts = parse("--debug")
      opts.template.should == "template"
      opts.template_links.should == true
    end

    it "has a shorthand -d" do
      opts = parse("-d")
      opts.template.should == "template"
      opts.template_links.should == true
    end
  end

  describe :warnings do
    it "default to empty array" do
      parse().warnings.should == []
    end

    it "are parsed with Warnings::Parser" do
      ws = parse("--warnings", "+foo,-bar").warnings
      ws.length.should == 2
      ws[0][:type].should == :foo
      ws[0][:enabled].should == true
      ws[1][:type].should == :bar
      ws[1][:enabled].should == false
    end
  end

  describe :verbose do
    it "defaults to false" do
      parse().verbose.should == false
    end

    it "set to true when --verbose used" do
      parse("--verbose").verbose.should == true
    end

    it "set to true when -v used" do
      parse("-v").verbose.should == true
    end
  end

  # Boolean options
  {
    :seo => false,
    :tests => false,
    :source => true, # TODO
    :ignore_global => false,
    :ext4_events => nil, # TODO
    :touch_examples_ui => false,
    :cache => false,
    :warnings_exit_nonzero => false,
    :color => nil, # TODO
    :pretty_json => nil,
    :template_links => false,
  }.each do |attr, default|
    describe attr do
      it "defaults to #{default.inspect}" do
        parse().send(attr).should == default
      end

      it "set to true when --#{attr} used" do
        parse("--#{attr.to_s.gsub(/_/, '-')}").send(attr).should == true
      end

      it "set to false when --no-#{attr} used" do
        parse("--no-#{attr.to_s.gsub(/_/, '-')}").send(attr).should == false
      end
    end
  end

  # Simple setters
  {
    :encoding => "--encoding",
    :title => ["--title", "Documentation - JSDuck"],
    :footer => ["--footer", "Generated on {DATE} by {JSDUCK} {VERSION}."],
    :welcome => "--welcome",
    :guides => "--guides",
    :videos => "--videos",
    :examples => "--examples",
    :categories => "--categories",
    :new_since => "--new-since",
    :comments_url => "--comments-url",
    :comments_domain => "--comments-domain",
    :examples_base_url => "--examples-base-url",
    :link => ["--link", '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'],
    :img => ["--img", '<p><img src="%u" alt="%a" width="%w" height="%h"></p>'],
    :eg_iframe => "--eg-iframe",
    :cache_dir => "--cache-dir",
    :extjs_path => ["--extjs-path", "extjs/ext-all.js"],
    :local_storage_db => ["--local-storage-db", "docs"],
  }.each do |attr, (option, default)|
    describe attr do
      it "defaults to #{default.inspect}" do
        parse().send(attr).should == default
      end
      it "is set to given string value" do
        parse(option, "some string").send(attr).should == "some string"
      end
    end
  end

  # HTML and CSS options that get concatenated
  {
    :head_html => "--head-html",
    :body_html => "--body-html",
    :css => "--css",
    :message => "--message",
  }.each do |attr, option|
    describe attr do
      it "defaults to empty string" do
        parse().send(attr).should == ""
      end

      it "can be used multiple times" do
        parse(option, "Some ", option, "text").send(attr).should == "Some text"
      end
    end
  end

  # Multiple paths
  {
    :exclude => "--exclude",
    :images => "--images",
    :tags => "--tags",
  }.each do |attr, option|
    describe attr do
      it "defaults to empty array" do
        parse().send(attr).should == []
      end

      it "can be used multiple times" do
        parse(option, "foo", option, "bar").send(attr).should == ["foo", "bar"]
      end

      it "can be used with comma-separated list" do
        parse(option, "foo,bar").send(attr).should == ["foo", "bar"]
      end
    end
  end

end
