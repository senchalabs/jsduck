JSDuck
======

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
[ext-doc]: http://ext-doc.org/
[Markdown]: http://daringfireball.net/projects/markdown/
[ext4-docs]: http://docs.sencha.com/ext-js/4-0/
[touch2-docs]: http://docs.sencha.com/touch/2-0/
[other-docs]: http://docs.sencha.com/
[documentation]: https://github.com/senchalabs/jsduck/wiki
[video]: http://vimeo.com/33465319

Getting it
----------

Standard rubygems install should do:

    $ [sudo] gem install jsduck

If you encounter errors during gem installation, you may need to
install the header files for compiling extension modules for Ruby 1.9.
For Debian systems you'll need the `ruby1.9-dev` package.  For Red Hat
/ CentOS / Fedora use the `ruby-devel` package.

In **OSX Mountain Lion** the compilation of `therubyracer` dependency
often fails for so far unknown reasons.  Most users have found a
solution in upgrading to Ruby 1.9 using [RVM][].

For **Windows** users out there, you can download the binary version,
which includes Ruby interpreter and all dependencies bundled in a
single .exe file.  Grab it from the [download page][].

Alternatively you can install through rubygems, but you need to do
some additional tweaks. First go and [download][libs download]
therubyracer gem and v8 lib that stereobooster has built for
windows. You need to install this special rubyracer version instead of
the one from rubygems:

    > gem install therubyracer-0.11.0beta1-x86-mingw32.gem

To make it actually work you need `v8.dll` somewhere in your
system. Extract the `lib_v8.3.11.9.zip` take the `v8.dll` inside it
and place into the `bin` directory of your Ruby installation (other
dirs that are on your PATH can work too, but I've found this to be the
most sensible place to put it). Now you're ready to install JSDuck:

    > gem install jsduck

[RVM]: https://rvm.io/
[download page]: https://sourceforge.net/projects/jsduck/files/
[libs download]: https://github.com/stereobooster/therubyracer/downloads

Usage
-----

For the simplest test-run just use the `--builtin-classes` option to
automatically produce documentation for JavaScript builtin classes
like Array, String and Object:

    $ jsduck --builtin-classes --output your/docs

You can also use `--verbose` option to see what's actually happening.

To generate docs for Ext JS 4 add path to the corresponding src/ dir:

    $ jsduck ext-4.1.1/src \
             --builtin-classes \
             --images ext-4.1.1/docs/images \
             --warnings=-no_doc,-dup_member,-link_ambiguous \
             --external XMLHttpRequest \
             --output your/docs

The `--images` option specifies a path for images included with
`{@img}` tags inside the source code.

The `--warnings` option disables some of the warnings which you would
otherwise be overwhelmed with. That's because Ext JS 4.1.1 was
released when JSDuck 4 wasn't out yet.  Sorry for that, JSDuck just
wants to be helpful. Similarly the `--external` option defines
`XMLHttpRequest` as an external class, otherwise a warning would be
thrown.

Another thing that often happens is that JSDuck is unable to determine
into which class a member belongs and will place all such items into a
global class - you can disable this using the `--ignore-global`
switch.  For full list of all command line options type
`jsduck --help`.  For help on a specific option use
`--help=--some-option`.

To generate docs for your own project, simply name additional input
directories:

    $ jsduck ext-4.1.1/src project1/js project2/js ...

Note that the resulting documentation will only contain the API
documentation.  Guides, videos and examples will not be present.
These can be added using more command line options as explained in the
[documentation][].


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
- Bryntum [Siesta unit testing framework](http://www.bryntum.com/products/siesta/docs/)
- [CKEditor](http://docs.ckeditor.com)
- [GeoExt 2](https://github.com/geoext/geoext2)
- Rally Software [Rally App SDK](https://rally1.rallydev.com/apps/2.0p/doc/)
- [Sencha](http://docs.sencha.com) - obviously :)

These are some that we know of. Want your project listed here? Drop us a line.


Copying
-------

JSDuck is distributed under the terms of the GNU General Public
License version 3.

JSDuck was developed by [Rene Saarsoo](http://triin.net),
with many contributions from [Nick Poulden](https://github.com/nick).

Thanks to [Ondřej Jirman](https://github.com/megous),
[Thomas Aylott](https://github.com/subtleGradient),
[johnnywengluu](https://github.com/johnnywengluu),
[gevik](https://github.com/gevik),
[ligaard](https://github.com/ligaard),
[Bill Hubbard](http://www.sencha.com/forum/member.php?272458-BillHubbard),
[Ed Spencer](https://github.com/edspencer),
[atian25](https://github.com/atian25),
Katherine Chu,
[Rob Dougan](https://github.com/rdougan),
[Dave Thompson](https://github.com/limscoder),
[burnnat](https://github.com/burnnat),
[vjetteam](https://github.com/vjetteam),
[Chris Westbrook](https://github.com/cnstaging),
[Scott Whittaker](https://github.com/scottrobertwhittaker),
[Timo Tijhof](https://github.com/Krinkle),
and many-many others who reported bugs, submitted patches, and
provided a lot of useful input.


Changelog
---------

See [Changelog](https://github.com/senchalabs/jsduck/wiki/Changelog) page in wiki.


More questions?
---------------

Feel free to [post an issue][issues], but read the [FAQ][] first.

[issues]: https://github.com/senchalabs/jsduck/issues
[FAQ]: https://github.com/senchalabs/jsduck/wiki/FAQ
