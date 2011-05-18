#/usr/bin/env bash

# The Bash script I'm currently using to generate documentation from
# latest ExtJS SDK.

# Sorry, these are currently hard-coded :(
SDK_DIR=~/Projects/sencha/SDK
OUT_DIR=~/Projects/sencha/jsduck/out

ruby bin/jsduck \
     --external=Error \
     --template-links \
     --link='<a href="#/api/%c%-%m" rel="%c%-%m" class="docClass">%a</a>' \
     --img='<p><img src="doc-resources/%u" alt="%a"></p>' \
     --guides=$SDK_DIR/guides \
     --output=$OUT_DIR \
     $SDK_DIR/extjs/src $SDK_DIR/platform/src $SDK_DIR/platform/core/src

# --template-links to create symbolic links to template files instead
# of copying them over.  Useful for development.  Turn off for
# deployment.

# --external=Error to ignore the Error class that Ext.Error extends.

# Note that we wrap image template inside <p> because {@img} often
# appears inline withing text, but that just looks ugly in HTML

# Finally copy over the images that documentation links to.
cp -r $SDK_DIR/extjs/doc-resources $OUT_DIR/doc-resources
cp -r $SDK_DIR/platform/doc-resources/* $OUT_DIR/doc-resources

