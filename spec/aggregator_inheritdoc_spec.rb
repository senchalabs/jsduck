require "jsduck/aggregator"
require "jsduck/source/file"
require "jsduck/class"
require "jsduck/relations"
require "jsduck/inherit_doc"

describe JsDuck::Aggregator do
  def parse(string)
    agr = JsDuck::Aggregator.new
    agr.aggregate(JsDuck::Source::File.new(string))
    relations = JsDuck::Relations.new(agr.result.map {|cls| JsDuck::Class.new(cls) })
    JsDuck::InheritDoc.new(relations).resolve_all
    relations
  end

  shared_examples_for "@inheritdoc" do
    it "original method keeps its name" do
      @orig[:name].should == "bar"
    end

    it "new method keeps its name" do
      @inheritdoc[:name].should == "foobar"
    end

    it "inheritdoc merges comment from original and its own comment" do
      @inheritdoc[:doc].should == "New comment.\n\nOriginal comment."
    end
  end

  describe "@inheritdoc of method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
           */

        /** @class Core */
          /**
           * @method foobar
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"

    it "inherits parameters" do
      @inheritdoc[:params].length.should == 2
    end

    it "inherits return value" do
      @inheritdoc[:return][:type].should == "String"
    end
  end

  # Helper to parse simple source codes to test if @inheritdoc tag
  # aliases work
  def parse_simple_source(at_tag)
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           */

        /** @class Core */
          /**
           * @method foobar
           * New comment.
           * #{at_tag} Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
  end

  describe "@inheritDoc" do
    before do
      parse_simple_source("@inheritDoc")
    end

    it_behaves_like "@inheritdoc"
  end

  describe "@alias" do
    before do
      parse_simple_source("@alias")
    end

    it_behaves_like "@inheritdoc"
  end

  describe "@inheritdoc of event" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @event bar
           * Original comment.
           * @param arg1
           * @param arg2
           */

        /** @class Core */
          /**
           * @event foobar
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"

    it "inherits parameters" do
      @inheritdoc[:params].length.should == 2
    end

    it "doesn't get return value" do
      @inheritdoc[:return].should == nil
    end
  end

  describe "@inheritdoc of cfg" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @cfg bar
           * Original comment.
           */

        /** @class Core */
          /**
           * @cfg foobar
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"

    it "doesn't get parameters" do
      @inheritdoc[:params].should == nil
    end

    it "doesn't get return value" do
      @inheritdoc[:return].should == nil
    end
  end

  describe "@inheritdoc of static method" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @static
           */

        /** @class Core */
          /**
           * @method foobar
           * New comment.
           * @inheritdoc Foo#bar
           * @static
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"
  end

  describe "@inheritdoc with type info" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @cfg bar
           * Original comment.
           */
          /**
           * @method bar
           * Method comment.
           */
          /**
           * @property bar
           * Prop comment.
           */

        /** @class Core */
          /**
           * @cfg foobar
           * New comment.
           * @inheritdoc Foo#cfg-bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"
  end

  describe "using @inheritdoc to inherit from another type of member" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           */

        /** @class Core */
          /**
           * @event foobar
           * New comment.
           * @inheritdoc Foo#method-bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"

    it "keeps the type of the member" do
      @inheritdoc[:tagname].should == :event
    end
  end

  describe "@inheritdoc without type info uses the type of itself" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @cfg bar
           * Original comment.
           */
          /**
           * @method bar
           * Method comment.
           */
          /**
           * @property bar
           * Prop comment.
           */

        /** @class Core */
          /**
           * @cfg foobar
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"
  end

  describe "@inheritdoc with staticality info" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * @static
           * Original comment.
           */
          /**
           * @method bar
           * Method comment.
           */

        /** @class Core */
          /**
           * @method foobar
           * New comment.
           * @inheritdoc Foo#static-bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"
  end

  describe "@inheritdoc without staticality info uses the statics of itself" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * @static
           * Original comment.
           */
          /**
           * @method bar
           * Method comment.
           */

        /** @class Core */
          /**
           * @method foobar
           * @static
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
    end

    it_behaves_like "@inheritdoc"
  end

  describe "recursive @inheritdocs" do
    before do
      @docs = parse(<<-EOF)
        /** @class Foo */
          /**
           * @method bar
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
           */

        /** @class HyperCore */
          /**
           * @method zap
           * New comment 2.
           * @inheritdoc Core#foobar
           */

        /** @class Core */
          /**
           * @method foobar
           * New comment.
           * @inheritdoc Foo#bar
           */
      EOF
      @orig = @docs["Foo"][:members][0]
      @inheritdoc = @docs["Core"][:members][0]
      @inheritdoc2 = @docs["HyperCore"][:members][0]
    end

    it_behaves_like "@inheritdoc"

    it "inheritdoc2 inherits params from first method" do
      @inheritdoc2[:params].length.should == 2
    end
  end

  shared_examples_for "with member name parameter" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Child
         */
          /**
           * @method bar
           * Original comment.
           */
          /**
           * @method foobar
           * #{@tagname} #bar
           * New comment.
           */
      EOF
      @inheritdoc = @docs["Child"][:members][1]
    end

    it "merges comment from referenced member" do
      @inheritdoc[:doc].should == "New comment.\n\nOriginal comment."
    end
  end

  describe "@inheritdoc" do
    before do
      @tagname = "@inheritdoc"
    end
    it_behaves_like "with member name parameter"
  end

  describe "@alias" do
    before do
      @tagname = "@alias"
    end
    it_behaves_like "with member name parameter"
  end

  describe "@inheritdoc without parameter" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Parent
         */
          /**
           * @method foo
           * Original comment.
           * @param arg1
           * @param arg2
           * @return {String}
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

    it "inherits docs from parent class method" do
      @method[:doc].should == "Original comment."
    end
  end

  describe "@inheritdoc without parent" do
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

  describe "@inheritdoc without method in parent" do
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

  describe "@inheritdoc with class name in class" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Parent
         * Original comment.
         */
        /**
         * @class Child
         * New comment.
         * @inheritdoc Parent
         */
      EOF
      @cls = @docs["Child"]
    end

    it "combines docs from referenced class and current class" do
      @cls[:doc].should == "New comment.\n\nOriginal comment."
    end
  end

  describe "plain @inheritdoc in class" do
    before do
      @docs = parse(<<-EOF)
        /**
         * @class Parent
         * Original comment.
         */
        /**
         * @class Child
         * @extends Parent
         * New comment.
         * @inheritdoc
         */
      EOF
      @cls = @docs["Child"]
    end

    it "combines docs from parent and child" do
      @cls[:doc].should == "New comment.\n\nOriginal comment."
    end
  end

  describe "autoinherit with config:{}" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            config: {
                /**
                 * My config.
                 */
                foo: 5
            }
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            config: {
                foo: 10
            }
        });
      EOF
      @cls = @docs["Child"]
      @cfg = @cls[:members][0]
    end

    it "inherits docs from parent" do
      @cfg[:doc].should == "My config."
    end

    it "inherits being public from parent" do
      @cfg[:private].should == nil
    end

    it "inherits being public from parent (meta)" do
      @cfg[:meta][:private].should == nil
    end
  end

  describe "autoinherit with config:{} through two parents" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            config: {
                /**
                 * My config.
                 */
                foo: 5
            }
        });
        /** */
        Ext.define("Middle", {
            extend: "Parent",
            config: {
                foo: 7
            }
        });
        /** */
        Ext.define("Child", {
            extend: "Middle",
            config: {
                foo: 10
            }
        });
      EOF
      @cls = @docs["Child"]
      @cfg = @cls[:members][0]
    end

    it "inherits docs from parent" do
      @cfg[:doc].should == "My config."
    end

    it "inherits being public from parent" do
      @cfg[:private].should == nil
    end

    it "inherits being public from parent (meta)" do
      @cfg[:meta][:private].should == nil
    end
  end

  describe "autoinherit with config:{} and no parent" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Child", {
            config: {
                foo: 10
            }
        });
      EOF
      @cls = @docs["Child"]
      @cfg = @cls[:members][0]
    end

    it "becomes private" do
      @cfg[:private].should == true
    end

    it "becomes private (meta)" do
      @cfg[:meta][:private].should == true
    end
  end

  describe "autoinherit with several meta tags" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            /**
             * My property.
             * @protected
             * @deprecated 4.0 Use something else.
             */
            foo: 5
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            foo: 10
        });
      EOF
      @cls = @docs["Child"]
      @property = @cls[:members][0]
    end

    it "inherits @protected" do
      @property[:meta][:protected].should == true
    end

    it "inherits @deprecated" do
      @property[:meta][:deprecated][:version].should == "4.0"
      @property[:meta][:deprecated][:text].should == "Use something else."
    end
  end

  describe "autoinherit with his own and parent meta tags" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            /**
             * My property.
             * @protected
             * @deprecated 3.0
             */
            foo: 5
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            // @readonly
            // @deprecated 4.0
            foo: 10
        });
      EOF
      @cls = @docs["Child"]
      @property = @cls[:members][0]
    end

    it "inherits @protected" do
      @property[:meta][:protected].should == true
    end

    it "keeps @readonly" do
      @property[:meta][:readonly].should == true
    end

    it "overrides @deprecated of parent with its own @deprecated" do
      @property[:meta][:deprecated][:version].should == "4.0"
    end
  end

  describe "inheriting cfg/property type" do
    let(:members) do
      ms = parse(<<-EOF)["Child"][:members]
        /** */
        Ext.define("Parent", {
            /**
             * @property {String/Number}
             */
            foo: 42,
            /**
             * @property {String/Number}
             */
            bar: 5,
            baz: 15,
            /**
             * @property {String/Number}
             * @private
             */
            zap: 7
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            /**
             * @inheritdoc
             */
            foo: "blah",
            bar: "blah",
            baz: "blah",
            zap: "blah"
        });
      EOF
      hash = {}
      ms.each {|p| hash[p[:name]] = p }
      hash
    end

    it "explicit inherit from public parent keeps the type of parent" do
      members["foo"][:type].should == "String/Number"
    end

    it "autoinherit from public parent keeps the type of parent" do
      members["bar"][:type].should == "String/Number"
    end

    it "autoinherit from private parent overrides parent type" do
      members["baz"][:type].should == "String"
    end

    it "autoinherit from explicitly documented private parent keeps parent type" do
      members["zap"][:type].should == "String/Number"
    end
  end

  describe "instance members autoinherit with parent containing statics" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            inheritableStatics: {
                /** My method. */
                foo: function() {},
                /** My property. */
                bar: 10
            }
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            foo: function(){},
            bar: 11
        });
      EOF
      @cls = @docs["Child"]
    end

    it "doesn't inherit from parent static method" do
      @cls[:members][0][:doc].should_not == "My method."
    end

    it "doesn't inherit from parent static property" do
      @cls[:members][1][:doc].should_not == "My property."
    end
  end

  describe "static members autoinherit with parent containing statics" do
    before do
      @docs = parse(<<-EOF)
        /** */
        Ext.define("Parent", {
            inheritableStatics: {
                /** My method. */
                foo: function() {},
                /** My property. */
                bar: 10
            }
        });
        /** */
        Ext.define("Child", {
            extend: "Parent",
            inheritableStatics: {
                foo: function(){},
                bar: 11
            }
        });
      EOF
      @cls = @docs["Child"]
    end

    it "inherits from parent static method" do
      @cls[:members][0][:doc].should == "My method."
    end

    it "inherits from parent static property" do
      @cls[:members][1][:doc].should == "My property."
    end
  end
end
