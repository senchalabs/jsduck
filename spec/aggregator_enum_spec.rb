require "jsduck/aggregator"
require "jsduck/source/file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    agr.process_enums
    agr.result
  end

  shared_examples_for "enum" do
    it "creates class" do
      doc[:tagname].should == :class
    end
    it "sets :enum field" do
      doc[:enum].should_not == nil
    end
    it "detects name" do
      doc[:name].should == "My.enum.Type"
    end
    it "detects type" do
      doc[:enum][:type].should == "String"
    end
    it "detects no extends" do
      doc[:extends].should == nil
    end
    it "detects docs" do
      doc[:doc].should == "Some documentation."
    end

    it "detects two members" do
      doc[:members].length.should == 2
    end

    describe "in first member" do
      let(:prop) { doc[:members][0] }
      it "detects name" do
        prop[:name].should == 'foo'
      end
      it "detects type" do
        prop[:type].should == 'String'
      end
      it "detects default value" do
        prop[:default].should == "'a'"
      end
    end
  end

  shared_examples_for "doc_enum" do
    it "detects enum as only for documentation purposes" do
      doc[:enum][:doc_only].should == true
    end
  end

  shared_examples_for "non_doc_enum" do
    it "doesn't detect an enum for doc purposes only" do
      doc[:enum][:doc_only].should_not == true
    end
  end

  describe "explicit enum" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum {String} My.enum.Type
         * Some documentation.
         */
            /** @property {String} [foo='a'] */
            /** @property {String} [bar='b'] */
      EOS
    end

    it_should_behave_like "enum"
    it_should_behave_like "non_doc_enum"
  end

  describe "implicitly named enum" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum {String}
         * Some documentation.
         */
        My.enum.Type = {
            /** First value docs */
            foo: 'a',
            /** Second value docs */
            bar: 'b'
        };
      EOS
    end

    it_should_behave_like "enum"
    it_should_behave_like "non_doc_enum"
  end

  describe "enum with implicit values" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum {String}
         * Some documentation.
         */
        My.enum.Type = {
            foo: 'a',
            bar: 'b'
        };
      EOS
    end

    it_should_behave_like "enum"
  end

  describe "enum without a type" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum
         * Some documentation.
         */
        My.enum.Type = {
            foo: 'a',
            bar: 'b'
        };
      EOS
    end

    it "infers type from code" do
      doc[:enum][:type].should == 'String'
    end
  end

  describe "enum without a type and no type in code" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum
         * Some documentation.
         */
        My.enum.Type = {};
      EOS
    end

    it "defaults to Object type" do
      doc[:enum][:type].should == 'Object'
    end
  end

  describe "enum with multiple types in code" do
    let(:doc) do
      parse(<<-EOS)[0]
        /**
         * @enum
         * Some documentation.
         */
        My.enum.Type = {
            foo: 15,
            bar: 'hello',
            baz: 8
        };
      EOS
    end

    it "defaults to auto-generated type union" do
      doc[:enum][:type].should == 'Number/String'
    end
  end

  describe "enum of two properties" do
    let(:doc) do
      parse(<<-EOS)[0]
        /** @enum */
        My.enum.Type = {
            foo: "hello",
            /** @inheritdoc */
            bar: 8
        };
      EOS
    end

    it "gets stripped from :inheritdoc tag in auto-detected member" do
      doc[:members][0][:inheritdoc].should == nil
    end

    it "keeps the explicit :inheritdoc tag in doc-commented member" do
      doc[:members][1][:inheritdoc].should_not == nil
    end
  end

  describe "enum with array value" do
    let(:doc) do
      parse(<<-EOS)[0]
        /** @enum */
        My.enum.Type = [
            "foo",
            "bar"
        ];
      EOS
    end

    let(:members) { doc[:members] }

    it_should_behave_like "doc_enum"

    it "detects all members" do
      members.length.should == 2
    end

    it "detects as property" do
      members[0][:tagname].should == :property
    end

    it "gets name" do
      members[0][:name].should == 'foo'
    end

    it "gets default value" do
      members[0][:default].should == '"foo"'
    end

    it "gets type" do
      members[0][:type].should == 'String'
    end
  end

  describe "enum with documented array values" do
    let(:doc) do
      parse(<<-EOS)[0]
        /** @enum */
        My.enum.Smartness = [
            // A wise choice.
            "wise",
            // A foolish decision.
            "fool"
        ];
      EOS
    end

    let(:members) { doc[:members] }

    it_should_behave_like "doc_enum"

    it "detects docs of first member" do
      members[0][:doc].should == 'A wise choice.'
    end

    it "detects docs of second member" do
      members[1][:doc].should == 'A foolish decision.'
    end
  end

  describe "enum of widget.*" do
    let(:doc) do
      parse(<<-EOS)[0]
        /** @enum [xtype=widget.*] */
        /** @class Form @alias widget.form */
        /** @class Button @alias widget.button */
        /** @class TextArea @alias widget.textarea @private */
      EOS
    end

    it "detects enum type as String" do
      doc[:enum][:type].should == "String"
    end

    it_should_behave_like "doc_enum"

    let(:members) { doc[:members] }

    it "gathers all 3 widget.* aliases" do
      members.length.should == 3
    end

    it "lists all widget.* names" do
      Set.new(members.map {|p| p[:name] }).should == Set.new(["form", "button", "textarea"])
    end

    it "auto-generates property default values" do
      Set.new(members.map {|p| p[:default] }).should == Set.new(["'form'", "'button'", "'textarea'"])
    end

    it "sets property type to String" do
      members[0][:type].should == "String"
    end

    it "sets enum value from private class as private" do
      members.find_all {|p| p[:private] }.map {|p| p[:name] }.should == ["textarea"]
    end

    it "lists class name in enum property docs" do
      members.find_all {|p| p[:name] == 'form' }[0][:doc].should == "Alias for {@link Form}."
    end
  end

end
