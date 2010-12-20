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
     */
    Ext.form.TextField = Ext.extend(Ext.form.Field,  {

As you can see, JsDuck supports formatting comments with friendly
[Markdown][] syntax.  And it can infer several things from the code
(like @class and @extends in this case), so you don't have to repeat
yourself.

That's basically it.  Have fun.

[ExtJS]: http://www.sencha.com/products/js/
[ext-doc]: http://ext-doc.org/
[Markdown]: http://daringfireball.net/projects/markdown/


Dependencies
------------

To run, you need Ruby 1.8 with [json][] and [RDiscount][] gems.

For development Rake and RSpec are also needed.

[json]: http://flori.github.com/json/
[RDiscount]: https://github.com/rtomayko/rdiscount


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
* Constructor first in methods list
* Search, not just searching from official ExtJS documentation
* Support for custom @tags


More
----

* [List of supported @tags][tags]
* [List of doc-comment errors(?) found in ExtJS source][errors]

[tags]: https://github.com/nene/jsduck/wiki/List-of-supported-@tags
[errors]: https://github.com/nene/jsduck/wiki/List-of-doc-comment-errors(%3F)-found-in-ExtJS-source


Copying
-------

JsDuck is distributed under the terms of the GNU General Public License version 3.

JsDuck was developed by [Rene Saarsoo](http://triin.net).

