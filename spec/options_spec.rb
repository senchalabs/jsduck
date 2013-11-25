require "jsduck/util/null_object"
require "jsduck/options/parser"

describe JsDuck::Options::Parser do

  def mock_parse(methods, *argv)
    default_methods = {
      :dirname => Proc.new {|x| x },
      :expand_path => Proc.new {|x, pwd| x },
      :exists? => false,
    }
    file_class = JsDuck::Util::NullObject.new(default_methods.merge(methods))
    JsDuck::Options::Parser.new(file_class).parse(argv)
  end

  def parse(*argv)
    mock_parse({}, *argv)
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

  describe :output_dir do
    it "is set with --output option" do
      parse("--output", "foo/").output_dir.should == "foo/"
    end

    it "is set with -o option" do
      parse("-o", "foo/").output_dir.should == "foo/"
    end

    it "is set to :stdout with -" do
      parse("--output", "-").output_dir.should == :stdout
    end

    it "is invalid when :stdout but not export" do
      parse("--output", "-").validate!(:output_dir).should_not == nil
    end

    it "is valid when :stdout and export" do
      parse("--output", "-", "--export", "full").validate!(:output_dir).should == nil
    end

    it "is invalid when no output dir specified" do
      parse().validate!(:output_dir).should_not == nil
    end

    it "is valid when output dir exists and is a directory" do
      m = {:exists? => Proc.new {|f| f == "foo/"}, :directory? => true}
      mock_parse(m, "-o", "foo/").validate!(:output_dir).should == nil
    end

    it "is invalid when output dir is not a directory" do
      m = {:exists? => Proc.new {|f| f == "foo/"}, :directory? => false}
      mock_parse(m, "-o", "foo/").validate!(:output_dir).should_not == nil
    end

    it "is valid when parent dir of output dir exists" do
      m = {
        :exists? => Proc.new do |fname|
          case fname
          when "foo/"
            false
          when "parent/"
            true
          else
            false
          end
        end,
        :dirname => Proc.new do |fname|
          case fname
          when "foo/"
            "parent/"
          else
            fname
          end
        end
      }
      mock_parse(m, "-o", "foo/").validate!(:output_dir).should == nil
    end

    it "is invalid when parent dir of output dir is missing" do
      m = {:exists? => false}
      mock_parse(m, "-o", "foo/").validate!(:output_dir).should_not == nil
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

  describe :title do
    it "defaults to 'Documentation - JSDuck'" do
      opts = parse()
      opts.title.should == 'Documentation - JSDuck'
      opts.header.should == "<strong>Documentation</strong> JSDuck"
    end

    it "sets both title and header" do
      opts = parse("--title", "Docs - MyApp")
      opts.title.should == "Docs - MyApp"
      opts.header.should == "<strong>Docs</strong> MyApp"
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

  describe :imports do
    it "defaults to empty array" do
      parse().imports.should == []
    end

    it "expands into version and path components" do
      parse("--import", "1.0:/vers/1", "--import", "2.0:/vers/2").imports.should == [
        {:version => "1.0", :path => "/vers/1"},
        {:version => "2.0", :path => "/vers/2"},
      ]
    end

    it "expands pathless version number into just :version" do
      parse("--import", "3.0").imports.should == [
        {:version => "3.0"},
      ]
    end
  end

  describe :search do
    it "defaults to empty hash" do
      parse().search.should == {}
    end

    it "sets :url from --search-url" do
      parse("--search-url", "example.com").search[:url].should == "example.com"
    end

    it "sets :product and :version from --search-domain" do
      opts = parse("--search-domain", "Touch/2.0")
      opts.search[:product].should == "Touch"
      opts.search[:version].should == "2.0"
    end
  end

  describe :external_classes do
    it "contain Object and Array by default" do
      classes = parse().external_classes
      classes.should include("Object")
      classes.should include("Array")
    end

    it "can be used multiple times" do
      classes = parse("--external", "Foo", "--external", "Bar").external_classes
      classes.should include("Foo")
      classes.should include("Bar")
    end

    it "can be used with comma-separated list" do
      classes = parse("--external", "Foo,Bar").external_classes
      classes.should include("Foo")
      classes.should include("Bar")
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

  describe :template_dir do
    it "defaults to /template-min" do
      parse().template_dir.should =~ /template-min$/
    end

    it "is not validated when --export set" do
      opts = parse("--template", "foo", "--export", "full")
      opts.validate!(:template_dir).should == nil
    end

    it "is invalid when template dir has no /extjs dir" do
      m = {
        :exists? => false,
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template_dir).should_not == nil
    end

    it "is invalid when template dir has no /resources/css dir" do
      m = {
        :exists? => Proc.new {|fname| fname == "foo/extjs"},
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template_dir).should_not == nil
    end

    it "is valid when template dir contains both /extjs and /resouces/css dirs" do
      m = {
        :exists? => Proc.new {|fname| fname == "foo/extjs" || fname == "foo/resources/css" },
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template_dir).should == nil
    end
  end

  describe "--debug" do
    it "is equivalent of --template=template --template-links" do
      opts = parse("--debug")
      opts.template_dir.should == "template"
      opts.template_links.should == true
    end

    it "has a shorthand -d" do
      opts = parse("-d")
      opts.template_dir.should == "template"
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

  describe "--config" do
    it "interprets config options from config file" do
      file = JsDuck::Util::NullObject.new({
          :dirname => Proc.new {|x| x },
          :expand_path => Proc.new {|x, pwd| x },
          :exists? => Proc.new {|f| f == "conf.json" },
        })
      cfg = JsDuck::Util::NullObject.new({
          :read => ["-o", "foo", "file.js"]
        })

      opts = JsDuck::Options::Parser.new(file, cfg).parse(["--config", "conf.json"])
      opts.output_dir.should == "foo"
      opts.input_files.should == ["file.js"]
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
    :footer => ["--footer", "Generated on {DATE} by {JSDUCK} {VERSION}."],
    :welcome => "--welcome",
    :guides => "--guides",
    :videos => "--videos",
    :examples => "--examples",
    :categories_path => "--categories",
    :new_since => "--new-since",
    :comments_url => "--comments-url",
    :comments_domain => "--comments-domain",
    :examples_base_url => "--examples-base-url",
    :link_tpl => ["--link", '<a href="#!/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>'],
    :img_tpl => ["--img", '<p><img src="%u" alt="%a" width="%w" height="%h"></p>'],
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
