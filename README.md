JsDuck
======

API documentation generator for Ext JS 4.

           ,~~.
          (  6 )-_,
     (\___ )=='-'
      \ .   ) )
       \ `-' /    hjw
    ~'`~'`~'`~'`~

JsDuck aims to be a better documentation generator for [Ext JS][] than
the old [ext-doc][] was. It is used by Sencha to generate the official
[Ext JS 4 documentation][ext4-docs].

The highlights of JSDuck are [Markdown][] support and keeping you DRY
by inferring a lot of information from code.  Read the [Guide][] for
full overview.

[Ext JS]: http://www.sencha.com/products/js/
[ext-doc]: http://ext-doc.org/
[Markdown]: http://daringfireball.net/projects/markdown/
[ext4-docs]: http://docs.sencha.com/ext-js/4-0/
[Guide]: https://github.com/senchalabs/jsduck/wiki/Guide


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


Documenting your code
---------------------

All the supported syntax is described in the [Guide][]. 


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
