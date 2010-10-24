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
* @property
* @type
* @method - OK
* @event - OK
* @param - OK
* @return - OK

* @member
* @static
* @link

* @ignore @hide - these probably do exactly the same thing.
* @private - this is also almost the same, with the possibility that
  documentation could also be generated so, that it includes private
  methods, in which case stuff marked with @private is included,
  while @ignore and @hide are never included.

Some usage stats from ExtJS source:

* @hide 306 times
* @private 199 times
* @ignore 11 times.

* @namespace - Looks useless to me and indeed ExtJS source doesn't use
  it at all.

Some links:

* http://code.google.com/p/ext-doc/wiki/TagSpecification
* http://code.google.com/p/jsdoc-toolkit/w/list
