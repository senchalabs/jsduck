![JSDuck](https://raw.github.com/senchalabs/jsduck/master/opt/jsduck-logo-dark.png)
===================================================================================

**Warning: JSDuck is no more maintained!**
- If you're looking to adopt a documentation tool, try something else.
- If you're using JSDuck, consider moving over to something else.
- Even Sencha itself doesn't use it any more, they use some internal tool, that's not available publicly.
- If you'd like to take over the maintenance of JSDuck, contact me by creating an issue.

[![Build Status](https://travis-ci.org/senchalabs/jsduck.png)](https://travis-ci.org/senchalabs/jsduck)

API documentation generator for Sencha JavaScript frameworks.

JSDuck aims to be a better documentation generator for [Ext JS][] than
the old [ext-doc][] was. It is used by Sencha to document [Ext JS
4][ext4-docs], [Sencha Touch][touch2-docs] and [several other][other-docs]
products.

The highlights of JSDuck are [Markdown][] support and keeping you DRY
by inferring a lot of information from code.  Read the
[documentation][] for full overview.

**New to JSDuck?** Watch [introductory talk by Nick Poulden][video]:

[<img src="http://b.vimeocdn.com/ts/227/178/227178682_200.jpg" alt="SenchaCon 2011 JSDuck talk" />][video]

[Ext JS]: http://www.sencha.com/products/js/
[ext-doc]: http://code.google.com/p/ext-doc/
[Markdown]: http://daringfireball.net/projects/markdown/
[ext4-docs]: http://docs.sencha.com/extjs/
[touch2-docs]: http://docs.sencha.com/touch/
[other-docs]: http://docs.sencha.com/
[documentation]: https://github.com/senchalabs/jsduck/wiki
[video]: http://vimeo.com/33465319

Getting it
----------

Standard rubygems install should do:

    $ [sudo] gem install jsduck

Or download the [Windows binary][winbin]. When you run into problems,
see the [installation guide][].

[winbin]: https://github.com/senchalabs/jsduck/releases
[installation guide]: https://github.com/senchalabs/jsduck/wiki/Installation

Usage
-----

For the simplest test-run just use the `--builtin-classes` option to
write documentation for JavaScript builtin classes like Array, String
and Object into `docs` directory:

    $ jsduck --builtin-classes --output docs

To generate docs for [Ext JS 4][] add path to the corresponding src/ dir:

    $ jsduck ext-4.2.1/src --output docs

And to create docs for your own Ext JS project, list the directory
with your files in addition to the Ext JS source files (this way the
docs of your classes will list all the properties and methods they
inherit from Ext JS classes):

    $ jsduck ext-4.2.1/src my-project/js --output docs

Unfortunately the above will throw lots of warnings at you, as
building the full Ext JS docs requires lots of additional settings.
For start you might want to simply ignore all these warnings
originating from Ext JS source:

    $ jsduck ext-4.2.1/src my-project/js --output docs \
             --warnings=-all:ext-4.2.1/src

But see the [Usage guide][] for more information on building Ext JS 4
docs.

[Ext JS 4]: http://www.sencha.com/products/extjs/
[Usage guide]: https://github.com/senchalabs/jsduck/wiki/Usage


Documenting your code
---------------------

Read the [documentation][] and take a look at [example.js][example].

[example]: https://github.com/senchalabs/jsduck/blob/master/opt/example.js


Hacking it
----------

See [Hacking guide](https://github.com/senchalabs/jsduck/wiki/Hacking) in wiki.


Who's using JSDuck?
-------------------

- Appcelerator [Titanium SDK](http://docs.appcelerator.com/titanium/2.0/index.html)
- AT&T [API Platform SDK for HTML5](https://code-api-att.com/SenchaSdk20Drop23Docs/)
- Bryntum [Siesta unit testing framework](http://www.bryntum.com/docs/siesta/)
- [CKEditor](http://docs.ckeditor.com)
- [GeoExt 2](https://github.com/geoext/geoext2)
- Rally Software [Rally App SDK](https://prod.help.rallydev.com/apps/2.0rc1/doc/)
- Wikimedia Foundation [MediaWiki](https://doc.wikimedia.org/mediawiki-core/master/js/)
  and [VisualEditor](https://doc.wikimedia.org/VisualEditor/master/)
- [Sencha](http://docs.sencha.com) - obviously :)

These are some that we know of. Want your project listed here? Drop us a line.


Copying
-------

JSDuck is distributed under the terms of the GNU General Public
License version 3.

JSDuck was developed by [Rene Saarsoo](http://triin.net),
with contributions from
[Nick Poulden](https://github.com/nick),
[Ondřej Jirman](https://github.com/megous),
[Thomas Aylott](https://github.com/subtleGradient),
[Dave Thompson](https://github.com/limscoder),
[Ed Spencer](https://github.com/edspencer),
[Rob Dougan](https://github.com/rdougan),
[Scott Whittaker](https://github.com/scottrobertwhittaker),
[Timo Tijhof](https://github.com/Krinkle),
[Brian Moeskau](https://github.com/bmoeskau),
[Garry Yao](https://github.com/garryyao),
[Yasin Okumus](https://github.com/lacivert),
[Nicholas Boll](https://github.com/NicholasBoll) and
Katherine Chu.

Many thanks goes also to those who have most eagerly reported bugs:
[Ryan Nauman](https://github.com/ryan-nauman),
[Raphael Franchet](https://github.com/raphdulaf),
[atian25](https://github.com/atian25),
[burnnat](https://github.com/burnnat),
[Raphael Pigulla](https://github.com/pigulla),
[Dmitry Bakaleinik](https://github.com/demongloom),
[Alan Lindsay](https://github.com/alindsay55661),
[Corey Butler](https://github.com/coreybutler),
[Nickolay Platonov](https://github.com/SamuraiJack),
[Matt Greer](https://github.com/city41),
[Richard](https://github.com/ritcoder) and
[Dmitry Pashkevich](https://github.com/dpashkevich).

There are lots of others I haven't named here, who have provided their
input.


Changelog
---------

See [the Releases page](https://github.com/senchalabs/jsduck/releases).


More questions?
---------------

Feel free to [post an issue][issues], but read the [FAQ][] first.

[issues]: https://github.com/senchalabs/jsduck/issues
[FAQ]: https://github.com/senchalabs/jsduck/wiki/FAQ
