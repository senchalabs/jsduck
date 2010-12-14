JsDuck
======

Simple JavaScript Duckumentation generator.

           ,~~.
          (  6 )-_,
     (\___ )=='-'
      \ .   ) )
       \ `-' /    hjw
    ~'`~'`~'`~'`~

This duck is starting to get ready...

Motivation for JsDuck: [Why ExtJS doc-comments suck][motivation]

[motivation]: http://www.triin.net/2010/03/14/Why_ExtJS_doc-comments_suck


Dependencies
------------

* Ruby 1.8
* [json](http://flori.github.com/json/)
* [RDiscount](https://github.com/rtomayko/rdiscount)

For development:

* Rake
* RSpec


List of supported @tags
-----------------------

* @class
* @extends
* @singleton
* @cfg
* @constructor
* @property
* @type
* @method
* @event
* @param
* @return alias @returns
* @static
* @xtype
* @member
* {@link}

* @ignore, @hide, @private, @protected - in JsDuck implementation
  @ignore, @hide and @protected are considered aliases for @private.
  (Some usage stats from ExtJS source: @hide 306 times, @private 199
  times, @ignore 11 times.)

Unsupported:

* @namespace - Looks useless to me and indeed ExtJS source doesn't use
  it at all.

Some links:

* [ext-doc @tags](http://code.google.com/p/ext-doc/wiki/TagSpecification)
* [jsdoc-toolkit @tags](http://code.google.com/p/jsdoc-toolkit/wiki/TagReference)


List of doc-comment errors(?) found in ExtJS source
---------------------------------------------------

The file `src/core/Error.js` documents `Ext.handleError` method. But
that doc-comment doesn't follow a @class definition, nor does it
contain @member, nor is it marked with @private, @hide, or @ignore.
Therefore this method is simply not included in official ExtJS
documentation.

The file `src/ext-core/src/core/Ext.js` has a doc-comment that says
"Removes a DOM node from the document." but it contains no @tags and
is followed by another doc-comment.  The result is that official ExtJS
documentation simply lists a nameless property of `Ext` class.

For some reason `@see` is only used inside normal comments, not in
doc-comments.  There are only 7 of these though.

Two uses of `@member` also name the item itself.  For example `@member
Ext apply` - although that's pretty much useless as that is followed
by code from which we can infer that the name should be `apply` plus
it's preceded by `@class Ext` so a member declaration shouldn't be
needed at all.  The other example is `@member Ext.Element
getTextWidth`, again followed by code that says the same thing.  Given
this silliness, JsDuck currently only supports the form `@member
ClassName`.

