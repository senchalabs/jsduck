require "jsduck/util/null_object"
require "jsduck/options/parser"

# Slower-running tests for Options::Parser, that require the parser to
# be instanciated before each test - which is sadly a bit slow.
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

  describe :output do
    it "is set with --output option" do
      parse("--output", "foo/").output.should == "foo/"
    end

    it "is set with -o option" do
      parse("-o", "foo/").output.should == "foo/"
    end

    it "is set to :stdout with -" do
      parse("--output", "-").output.should == :stdout
    end

    it "is invalid when :stdout but not export" do
      parse("--output", "-").validate!(:output).should_not == nil
    end

    it "is valid when :stdout and export" do
      parse("--output", "-", "--export", "full").validate!(:output).should == nil
    end

    it "is invalid when no output dir specified" do
      parse().validate!(:output).should_not == nil
    end

    it "is valid when output dir exists and is a directory" do
      m = {:exists? => Proc.new {|f| f == "foo/"}, :directory? => true}
      mock_parse(m, "-o", "foo/").validate!(:output).should == nil
    end

    it "is invalid when output dir is not a directory" do
      m = {:exists? => Proc.new {|f| f == "foo/"}, :directory? => false}
      mock_parse(m, "-o", "foo/").validate!(:output).should_not == nil
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
      mock_parse(m, "-o", "foo/").validate!(:output).should == nil
    end

    it "is invalid when parent dir of output dir is missing" do
      m = {:exists? => false}
      mock_parse(m, "-o", "foo/").validate!(:output).should_not == nil
    end
  end

  describe :template do
    it "defaults to /template-min" do
      parse().template.should =~ /template-min$/
    end

    it "is not validated when --export set" do
      opts = parse("--template", "foo", "--export", "full")
      opts.validate!(:template).should == nil
    end

    it "is invalid when template dir has no /extjs dir" do
      m = {
        :exists? => false,
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template).should_not == nil
    end

    it "is invalid when template dir has no /resources/css dir" do
      m = {
        :exists? => Proc.new {|fname| fname == "foo/extjs"},
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template).should_not == nil
    end

    it "is valid when template dir contains both /extjs and /resouces/css dirs" do
      m = {
        :exists? => Proc.new {|fname| fname == "foo/extjs" || fname == "foo/resources/css" },
      }
      opts = mock_parse(m, "--template", "foo")
      opts.validate!(:template).should == nil
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
      opts.output.should == "foo"
      opts.input_files.should == ["file.js"]
    end
  end

end
