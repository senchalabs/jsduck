JsDuck
======

Simple JavaScript Duckumentation generator.

           ,~~.
          (  6 )-_,
     (\___ )=='-'
      \ .   ) )
       \ `-' /    hjw
    ~'`~'`~'`~'`~

JsDuck aims to be a better documentation generator for [ExtJS][].
While it tries to do everything that [ext-doc][] does, it isn't
satisfied with it and aims to make your life much easier.

Basically JsDuck thinks that the following doc-comment really sucks:

    /**
     * @class Ext.form.TextField
     * @extends Ext.form.Field
     * <p>Basic text field.  Can be used as a direct replacement for traditional
     * text inputs, or as the base class for more sophisticated input controls
     * (like {@link Ext.form.TextArea} and {@link Ext.form.ComboBox}).</p>
     * <p><b><u>Validation</u></b></p>
     * <p>The validation procedure is described in the documentation for
     * {@link #validateValue}.</p>
     * <p><b><u>Alter Validation Behavior</u></b></p>
     * <p>Validation behavior for each field can be configured:</p>
     * <div class="mdetail-params"><ul>
     * <li><code>{@link Ext.form.TextField#invalidText invalidText}</code> :
     * the default validation message to show if any validation step above does
     * not provide a message when invalid</li>
     * <li><code>{@link Ext.form.TextField#maskRe maskRe}</code> :
     * filter out keystrokes before any validation occurs</li>
     * <li><code>{@link Ext.form.TextField#stripCharsRe stripCharsRe}</code> :
     * filter characters after being typed in, but before being validated</li>
     * </ul></div>
     *
     * @constructor Creates a new TextField
     * @param {Object} config Configuration options
     *
     * @xtype textfield
     */
    Ext.form.TextField = Ext.extend(Ext.form.Field,  {

Not quite so readable is it?  The source of ExtJS is filled with
comments just like that, and when you use ext-doc, you too are forced
to write such comments.

JsDuck does not like it.  Although it can handle comments like this,
it would like that you wrote comments like that instead:

    /**
     * Basic text field.  Can be used as a direct replacement for traditional
     * text inputs, or as the base class for more sophisticated input controls
     * (like {@link Ext.form.TextArea} and {@link Ext.form.ComboBox}).
     *
     * Validation
     * ----------
     *
     * The validation procedure is described in the documentation for
     * {@link #validateValue}.
     *
     * Alter Validation Behavior
     * -------------------------
     *
     * Validation behavior for each field can be configured:
     *
     * - `{@link Ext.form.TextField#invalidText invalidText}` :
     *   the default validation message to show if any validation step above
     *   does not provide a message when invalid
     * - `{@link Ext.form.TextField#maskRe maskRe}` :
     *   filter out keystrokes before any validation occurs
     * - `{@link Ext.form.TextField#stripCharsRe stripCharsRe}` :
     *   filter characters after being typed in, but before being validated
     *
     * @xtype textfield
     */
    Ext.form.TextField = Ext.extend(Ext.form.Field,  {

As you can see, JsDuck supports formatting comments with friendly
[Markdown][] syntax.  And it can infer several things from the code
(like @class and @extends in this case), so you don't have to repeat
yourself.  Also the constructor documentation is inherited from parent
class - so you don't have to restate that it takes a config object
again.

That's basically it.  Have fun.

[ExtJS]: http://www.sencha.com/products/js/
[ext-doc]: http://ext-doc.org/
[Markdown]: http://daringfireball.net/projects/markdown/


Getting it
----------

Standard rubygems install should do:

    $ [sudo] gem install jsduck

For hacking fork it from github.

    $ git clone git://github.com/nene/jsduck.git
    $ cd jsduck
    $ rake --tasks

JsDuck depends on [json][] and [RDiscount][] plus [RSpec][] for tests.

[json]: http://flori.github.com/json/
[RDiscount]: https://github.com/rtomayko/rdiscount
[RSpec]: http://rspec.info/


Usage
-----

Just call it from command line with output directory and a list of
JavaScript files:

    $ jsduck --verbose --output some/dir  your/project/*.js

To specify a lot of files you should probably create a script that
generates a file list and passes it through `xargs` to `jsduck`.

For example to generate documentation for ExtJS:

    $ find ext-3.3.1/src/ -name '*.js' | egrep -v 'locale/|test/|adapter/' | xargs jsduck -v -o output/

The `--verbose` flag creates a lot of output, but at least you will
see that something is happening.

Here's how the resulting documentation will look:

* [JsDuck generated documentation](http://triin.net/temp/jsduck/)
* [Official ExtJS documentation](http://dev.sencha.com/deploy/dev/docs/) (for comparison)


Documentation
-------------

Overview of documenting your code with JsDuck:

* [Class](https://github.com/nene/jsduck/wiki/Class)
* [Constructor](https://github.com/nene/jsduck/wiki/Constructor)
* [Config options](https://github.com/nene/jsduck/wiki/Cfg)
* [Properties](https://github.com/nene/jsduck/wiki/Property)
* [Methods](https://github.com/nene/jsduck/wiki/Method)
* [Events](https://github.com/nene/jsduck/wiki/Event)

More details:

* [List of supported @tags][tags]
* [List of doc-comment errors(?) found in ExtJS source][errors]

[tags]: https://github.com/nene/jsduck/wiki/List-of-supported-@tags
[errors]: https://github.com/nene/jsduck/wiki/List-of-doc-comment-errors(%3F)-found-in-ExtJS-source


Features and differences from ext-doc
-------------------------------------

JsDuck has some strong opinions, so some things are intentionally
missing.

* Support for Markdown in comments
* More things infered from the code
* No XML configuration file, just command line options
* Class documentation header doesn't separately list Package and Class -
  these are IMHO redundant.
* Class documentation header doesn't duplicate toolbar buttons -
  another redundancy
* Ext.Component has a component icon too, not only its descendants


Missing features
----------------

It's still in early beta, so several things supported by ext-doc are
currently missing:

* Links from documentation to source code
* List of subclasses
* Tree of parent classes
* Syntax highlighting of code examples
* Search, not just searching from official ExtJS documentation
* Support for custom @tags


Copying
-------

JsDuck is distributed under the terms of the GNU General Public License version 3.

JsDuck was developed by [Rene Saarsoo](http://triin.net).

