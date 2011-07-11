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
latest 2.0 version which this README documents, otherwise you will get
the stable but quite old [0.6][v0.6] version):

    $ [sudo] gem install --pre jsduck

For hacking fork it from github:

    $ git clone git://github.com/senchalabs/jsduck.git
    $ cd jsduck
    $ rake --tasks

JsDuck depends on [json][], [RDiscount][], and [parallel][]; plus
[RSpec][] for tests.

If you encounter errors during gem installation, you may need to
install the header files for compiling extension modules for ruby 1.8.
For Debian systems you'll need the `ruby1.8-dev` package.  For Red Hat
/ CentOS / Fedora use the `ruby-devel` package.

[v0.6]: https://github.com/senchalabs/jsduck/tree/v0.6
[json]: http://flori.github.com/json/
[RDiscount]: https://github.com/rtomayko/rdiscount
[parallel]: https://github.com/grosser/parallel
[RSpec]: http://rspec.info/


Usage
-----

Just call it from command line with output directory and a directory
containing your JavaScript files:

    $ jsduck your/project/js --verbose --output your/docs

The `--verbose` flag creates a lot of output, but at least you will
see that something is happening.


## Generating Docs for ExtJS 4

For the simplest test-run just pass in the src/ dir of ExtJS 4.  But
to get more similar result to the [official ExtJS 4
documentation][official], you should pass in some extra options and
copy over the doc-resources directory, which contains the images
referenced by the documentation:

    $ jsduck ext-4.0.2a/src --output your/docs --ignore-global --exclude Error
    $ cp -r ext-4.0.2a/docs/doc-resources your/docs/doc-resources

The `--ignore-global` will avoid the creation of a `global` class.
The `--exclude Error` will ignore references to the `Error` class,
which would otherwise result in several warnings.

Still, running JSDuck with the current ext-4.0.2a release is expected
to generate a lot of warnings.  These should be fixed in some later
releases.

[official]: http://docs.sencha.com/ext-js/4-0/


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

* 2.0.pre2 - Fixes for the previous pre-release.
  * New --stdout command line option.
  * Fix opening links in new tabs.
  * Few other small bugfixes and enhancements.

* 2.0.pre - Completely overhauled Ext4-themed version.
  * Currently in a pre-release state.

* 0.6.1 - Bug fixes.
  * Fix scrolling to class members in Chrome 12.
  * Make JSDuck work with Ruby 1.8.6.
  * Upgrade the embedded ExtJS to 3.4.0.

* 0.6 - JsDuck is now used for creating the official ExtJS4 documentation.
  * Automatic linking of class names found in comments.  Instead of writing
    `{@link Ext.Panel}` one can simply write `Ext.Panel` and link will be
    automatically created.
  * In generated docs, method return types and parameter types are also
    automatically linked to classes if such class is included to docs.
  * Support for `{@img}` tag for including images to documentation.
    The markup created by `{@link}` and `{@img}` tags can now be customized using
    the --img and --link command line options to supply HTML templates.
  * Links to source code are no more simply links to line numbers.
    Instead the source code files will contain ID-s like `MyClass-cfg-style`.
  * New tags: `@docauthor`, `@alternateClassName`, `@mixins`.
    The latter two Ext4 class properties are both detected from code and
    can also be defined (or overriden) in doc-comments.
  * Global methods are now placed to separate "global" class.
    Creation of this can be turned off using `--ignore-global`.
  * Much improved search feature.
    Search results are now ordered so that best matches are at the top.
    No more is there a select-box to match at beginning/middle/end -
    we automatically search first by exact match, then beginning and
    finally by middle.  Additionally the search no more lists a lot of
    duplicates - only the class that defines a method is listed, ignoring
    all the classes that inherit it.
  * Support for doc-comments in [SASS](http://sass-lang.com/) .scss files:
    For now, it's possible to document SASS variables and mixins.
  * Several bug fixes.

* 0.5 - Search and export
  * Search from the actually generated docs (not through sencha.com)
  * JSON export with --json switch.
  * Listing of mixed into classes.
  * Option to control or disable parallel processing.
  * Accepting directories as input (those are scanned for .js files)
  * Many bug fixes.

* 0.4 - Ext4 support
  * Support for Ext.define() syntax from ExtJS 4.
  * Showing @xtype and @author information on generated pages.
  * Showing filename and line number in warnings.
  * Fix for event showing the same doc as method with same name.

* 0.3 - Performance improvements
  * Significant peed improvements - most importantly utilizing
    multiple CPU-s (if available) to speed things up.  On my 4-core
    box JsDuck is now even faster than ext-doc.
  * Printing of performance info in verbose mode
  * Support for comma-first coding style
  * Few other fixes to JavaScript parsing

* 0.2 - most features of ext-doc supported.
  * Links from documentation to source code
  * Syntax highlighting of code examples
  * Tree of parent classes
  * List of subclasses

* 0.1 - initial version.
