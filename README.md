JsDuck
======

API documentation generator for ExtJS 4.

           ,~~.
          (  6 )-_,
     (\___ )=='-'
      \ .   ) )
       \ `-' /    hjw
    ~'`~'`~'`~'`~

JsDuck aims to be a better documentation generator for [ExtJS][] than
the old [ext-doc][] was.

The standard way to give some structure to the JavaDoc-style code
documentation is to use HTML in doc-comments.  Although the resulting
documentation will look pretty, this is often achieved by sacrificing
the readability of comments - HTML can get quite ugly.

JsDuck does not like it.  Although it can handle comments written in
HTML, it prefers a friendlier [Markdown][] syntax:

    /**
     * Basic text field.  Can be used as a direct replacement for traditional
     * text inputs, or as the base class for more sophisticated input controls
     * (like Ext.form.TextArea and Ext.form.ComboBox).
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
    Ext.define('Ext.form.field.Text', {
        extend: 'Ext.form.field.Base',

As you can see, JsDuck can infer several things from the code (like
`@class` and `@extends` in this case), so you don't have to repeat
yourself.

[ExtJS]: http://www.sencha.com/products/js/
[ext-doc]: http://ext-doc.org/
[Markdown]: http://daringfireball.net/projects/markdown/


Getting it
----------

Standard rubygems install should do (use the `--pre` switch to get the
latest 3.0 version which this README documents, otherwise you will get
the stable but quite old [0.6][v0.6] version):

    $ [sudo] gem install --pre jsduck

If you encounter errors during gem installation, you may need to
install the header files for compiling extension modules for ruby 1.8.
For Debian systems you'll need the `ruby1.8-dev` package.  For Red Hat
/ CentOS / Fedora use the `ruby-devel` package.

For **Windows** users out there, you can download the binary version,
which includes Ruby interpreter and all dependencies bundled in a
single .exe file.  Grab it from the [download page][].

[v0.6]: https://github.com/senchalabs/jsduck/tree/v0.6
[download page]: https://github.com/senchalabs/jsduck/downloads

Usage
-----

For the simplest test-run just pass in the src/ dir of Ext JS 4:

    $ jsduck ext-4.0.2a/src --output your/docs

Running JSDuck with the current ext-4.0.2a release is expected to
generate a lot of warnings.  Because of the bugs in doc-comments a
global class will also get created.  You can disable this by adding
`--ignore-global` switch.  If you are bothered by the excessive amount
of warnings, use the `--no-warnings` switch.  Now it might look like
nothing is happening... check out the `--verbose` flag.  For more
command line options type `jsduck --help`.

The latest ext-4.0.6 release will produce only few warnings, so use
that if you can get it.

Finally, to get more similar result to the [official Ext JS 4
documentation][official], copy over the doc-resources directory, which
contains the images referenced by the documentation:

    $ cp -r ext-4.0.2a/docs/doc-resources your/docs/doc-resources

Note that the resulting documentation will only contain the API
documentation.  Guides, videos and examples will not be present.
These can be added using more command line options, but for now those
aren't well documented as the ext-4.0.2a release doesn't contain the
source files for these.

To generate docs for your own project, simply add as many other input
directories as needed:

    $ jsduck ext-4.0.2a/src project1/js project2/js --output your/docs

Of course you don't have to include the whole Ext JS into your
documentation, but if your project is built on top of it, it makes
sense to do so - otherwise you won't be able to see which methods your
classes inherit from Ext JS classes.

[official]: http://docs.sencha.com/ext-js/4-0/


Hacking it
----------

See [Hacking guide](https://github.com/senchalabs/jsduck/wiki/Hacking) in wiki.


Documenting your code with JSDuck
---------------------------------

Here's an overview of [all the available @tags][tags], and how to use
them:

* [Class](https://github.com/senchalabs/jsduck/wiki/Class)
* [Constructor](https://github.com/senchalabs/jsduck/wiki/Constructor)
* [Config options](https://github.com/senchalabs/jsduck/wiki/Cfg)
* [Properties](https://github.com/senchalabs/jsduck/wiki/Property)
* [Methods](https://github.com/senchalabs/jsduck/wiki/Method)
* [Events](https://github.com/senchalabs/jsduck/wiki/Event)

[tags]: https://github.com/senchalabs/jsduck/wiki/List-of-supported-@tags


Copying
-------

JsDuck is distributed under the terms of the GNU General Public
License version 3.

JsDuck was developed by [Rene Saarsoo](http://triin.net),
with many contributions from [Nick Poulden](https://github.com/nick).

Thanks to [Ondřej Jirman](https://github.com/megous),
[Thomas Aylott](https://github.com/subtleGradient),
[johnnywengluu](https://github.com/johnnywengluu),
[gevik](https://github.com/gevik),
[ligaard](https://github.com/ligaard), and many-many others who
reported bugs, submitted patches, and provided a lot of useful input.


Changelog
---------

See [Changelog](https://github.com/senchalabs/jsduck/wiki/Changelog) page in wiki.
