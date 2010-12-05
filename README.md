JS-Duck
=======

Simple JavaScript Duckumentation generator.

           ,~~.
          (  6 )-_,
     (\___ )=='-'
      \ .   ) )
       \ `-' /    hjw
    ~'`~'`~'`~'`~

This duck is not ready yet...


List of @tags to support
------------------------

* @class - OK
* @extends - OK
* @singleton - OK
* @cfg - OK
* @constructor - OK
* @property - OK
* @type - OK
* @method - OK
* @event - OK
* @param - OK
* @return - OK
* @static - OK
* @xtype - OK

* @member
* @link

* @ignore @hide @private - in JsDuck implementation @ignore and @hide
  are considered aliases for @private.  (Some usage stats from ExtJS
  source: @hide 306 times, @private 199 times, @ignore 11 times.)
  Additionally @protected is currently also treated as @private.

* @namespace - Looks useless to me and indeed ExtJS source doesn't use
  it at all.

Some links:

* [ext-doc @tags](http://code.google.com/p/ext-doc/wiki/TagSpecification)
* [jsdoc-toolkit @tags](http://code.google.com/p/jsdoc-toolkit/wiki/TagReference)


List of doc-comment errors found in ExtJS source
------------------------------------------------

The file `src/core/Error.js` documents `Ext.handleError` method. But
that doc-comment doesn't follow a @class definition, nor does it
contain @member, nor is it marked with @private, @hide, or @ignore.
Therefore this method is simply not included in official ExtJS
documentation.

The file `src/ext-core/src/core/Ext.js` has a doc-comment that says
"Removes a DOM node from the document." but it contains no @tags and
is followed by another doc-comment.  The result is that official ExtJS
documentation simply lists a nameless property of `Ext` class.

