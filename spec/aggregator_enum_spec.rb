require "jsduck/aggregator"
require "jsduck/source_file"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::SourceFile.new(string))
    agr.infer_enum_types
    agr.result
  end

  shared_examples_for "enum" do
    it "creates class" do
      doc[:tagname].should == :class
    end
    it "sets :enum flag to true" do
      doc[:enum].should == true
    end
    it "detects name" do
      doc[:name].should == "My.enum.Type"
    end
    it "detects type" do
      doc[:type].should == "String"
    end
    it "detects no extends" do
      doc[:extends].should == nil
    end
    it "detects docs" do
      doc[:doc].should == "Some documentation."
    end

    it "detects two properties" do
      doc[:members][:property].length.should == 2
    end

    describe "in first property" do
      let(:prop) { doc[:members][:property][0] }
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
      doc[:type].should == 'String'
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
      doc[:type].should == 'Object'
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
      doc[:type].should == 'Number/String'
    end
  end

end
