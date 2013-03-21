require "mini_parser"

describe JsDuck::Aggregator do
  def parse(string)
    Helper::MiniParser.parse(string, {:inherit_doc => true})
  end

  shared_examples_for "docs inheritance" do
    it "inherits docs" do
      @inh1[:doc].should == "Original comment."
    end

    it "doesn't inherit docs when it has docs of its own" do
      @inh2[:doc].should == "Some docs of its own."
    end
  end

  describe "@inheritdoc in class" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Foo
         * Original comment.
         */

        /**
         * @class Inh1
         * @inheritdoc Foo
         */

        /**
         * @class Inh2
         * @inheritdoc Foo
         * Some docs of its own.
         */
      EOF
      @inh1 = @docs["Inh1"]
      @inh2 = @docs["Inh2"]
    end

    it_should_behave_like "docs inheritance"
  end

  describe "@inheritdoc in method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method foo
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
           * @throws {Exception}
           */

        /** @class Inh1 */
          /**
           * @method foo
           * @inheritdoc Foo#foo
           */

        /** @class Inh2 */
          /**
           * @method foo
           * @inheritdoc Foo#foo
           * Some docs of its own.
           * @param blah
           * @return {Number}
           * @throws {String}
           */

        /** @class Inh3 */
          /**
           * @inheritdoc Foo#foo
           */
          function foo(a,b,c,d,e) {
          }
      EOF
      @inh1 = @docs["Inh1"][:members][0]
      @inh2 = @docs["Inh2"][:members][0]
      @inh3 = @docs["Inh3"][:members][0]
    end

    it_should_behave_like "docs inheritance"

    it "inherits parameters" do
      @inh1[:params].length.should == 2
    end

    it "inherits return value" do
      @inh1[:return][:type].should == "String"
    end

    it "inherits throws" do
      @inh1[:throws][0][:type].should == "Exception"
    end

    it "doesn't inherit params when @param tag present" do
      @inh2[:params].length.should == 1
    end

    it "doesn't inherit return when @return tag present" do
      @inh2[:return][:type].should == "Number"
    end

    it "doesn't inherit throws when @throws tag present" do
      @inh2[:throws][0][:type].should == "String"
    end

    it "inherits parameters when auto-detected parameters present" do
      @inh3[:params].length.should == 2
    end
  end

  describe "@inheritdoc in cfg" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @cfg {String} foo
           * Original comment.
           */

        /** @class Inh1 */
          /**
           * @cfg foo
           * @inheritdoc Foo#foo
           */

        /** @class Inh2 */
          /**
           * @cfg {Number} foo
           * Some docs of its own.
           * @inheritdoc Foo#foo
           */

        /** @class Inh3 */
        Inh3 = {
          /**
           * @cfg
           * @inheritdoc Foo#foo
           */
          foo: 42
        }
      EOF
      @inh1 = @docs["Inh1"][:members][0]
      @inh2 = @docs["Inh2"][:members][0]
      @inh3 = @docs["Inh3"][:members][0]
    end

    it_should_behave_like "docs inheritance"

    it "inherits type" do
      @inh1[:type].should == "String"
    end

    it "doesn't inherit type when type specified in cfg itself" do
      @inh2[:type].should == "Number"
    end

    it "inherits type when auto-detected type present" do
      @inh3[:type].should == "String"
    end
  end

  describe "@inheritdoc with type info" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method foo
           * Method comment.
           */
          /**
           * @event foo
           * Event comment.
           */
          /**
           * @method foo
           * Static method comment.
           * @static
           */

        /** @class Inh1 */
          /**
           * @event foo
           * @inheritdoc Foo#method-foo
           */

        /** @class Inh2 */
          /**
           * @event foo
           * @inheritdoc Foo#static-method-foo
           */
      EOF
      @inh1 = @docs["Inh1"][:members][0]
      @inh2 = @docs["Inh2"][:members][0]
    end

    it "inherits from the type of member specified" do
      @inh1[:doc].should == "Method comment."
    end

    it "inherits from the static member when static- specified in reference" do
      @inh2[:doc].should == "Static method comment."
    end
  end

  describe "@inheritdoc without type info" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method foo
           * Method comment.
           */
          /**
           * @event foo
           * Event comment.
           */
          /**
           * @method foo
           * Static method comment.
           * @static
           */

        /** @class Inh1 */
          /**
           * @method foo
           * @inheritdoc Foo#foo
           */

        /** @class Inh2 */
          /**
           * @method foo
           * @inheritdoc Foo#foo
           * @static
           */
      EOF
      @inh1 = @docs["Inh1"][:members][0]
      @inh2 = @docs["Inh2"][:members][0]
    end

    it "inherits from the same type of member as itself" do
      @inh1[:doc].should == "Method comment."
    end

    it "inherits from the static member when it is static itself" do
      @inh2[:doc].should == "Static method comment."
    end
  end

  describe "recursive @inheritdocs" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Foo
         * Grandparent docs.
         */

        /**
         * @class ChildWithoutDocs
         * @inheritdoc Foo
         */
        /**
         * @class ChildWithDocs
         * @inheritdoc Foo
         * Parent docs.
         */

        /**
         * @class Inh1
         * @inheritdoc ChildWithoutDocs
         */
        /**
         * @class Inh2
         * @inheritdoc ChildWithDocs
         */
      EOF
      @inh1 = @docs["Inh1"]
      @inh2 = @docs["Inh2"]
    end

    it "inherits docs from grandparent when parent has no docs" do
      @inh1[:doc].should == "Grandparent docs."
    end

    it "inherits docs from parent when parent has docs of its own" do
      @inh2[:doc].should == "Parent docs."
    end
  end

  describe "@inheritdoc with member name only" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Foo
         */
          /**
           * @method bar
           * Original comment.
           */
          /**
           * @method foobar
           * @inheritdoc #bar
           */
      EOF
      @inheritdoc = @docs["Foo"][:members][1]
    end

    it "inherits from the member within current class" do
      @inheritdoc[:doc].should == "Original comment."
    end
  end

  describe "@inheritdoc without parameter" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Parent
         * Parent class comment.
         */
          /**
           * @method foo
           * Parent method comment.
           */

        /**
         * @class Child
         * @extends Parent
         * @inheritdoc
         */
          /**
           * @method foo
           * @inheritdoc
           */
      EOF
      @class = @docs["Child"]
      @method = @class[:members][0]
    end

    it "inherits docs from parent class" do
      @class[:doc].should == "Parent class comment."
    end

    it "inherits docs from parent class method" do
      @method[:doc].should == "Parent method comment."
    end
  end

  describe "@inheritdoc without parameter and parent class" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Child
         */
          /**
           * @method foo
           * @inheritdoc
           */
      EOF
      @method = @docs["Child"][:members][0]
    end

    it "inherits nothing" do
      @method[:doc].should == ""
    end
  end

  describe "@inheritdoc without parameter and no such method in parent class" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Parent
         */
        /**
         * @class Child
         * @extends Parent
         */
          /**
           * @method foo
           * @inheritdoc
           */
      EOF
      @method = @docs["Child"][:members][0]
    end

    it "inherits nothing" do
      @method[:doc].should == ""
    end
  end

  describe "@inheritdoc in method overriding mixin method" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Mixin
         */
          /**
           * @method foo
           * Docs in mixin.
           */
        /**
         * @class Child
         * @mixins Mixin
         */
          /**
           * @method foo
           * @inheritdoc
           */
      EOF
      @method = @docs["Child"][:members][0]
    end

    it "inherits docs from mixin" do
      @method[:doc].should == "Docs in mixin."
    end
  end

end
