#/usr/bin/env bash

# The Bash script I'm currently using to generate documentation from
# latest ExtJS SDK.

# Sorry, these are currently hard-coded :(
SDK_DIR=~/work/SDK
OUT_DIR=~/public_html/docs

ruby bin/jsduck \
     --template-links \
     --external=Error \
     --link='<a href="#/api/%c%-%m" rel="%c%#%m" class="docClass">%a</a>' \
     --img='<p><img src="doc-resources/%u" alt="%a"></p>' \
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

# Copy over guides
cp -r $SDK_DIR/guides $OUT_DIR/guides
# Remove documentation_style.md which we don't want
rm $OUT_DIR/guides/documentation_style.md
# convert markdown files in guides to HTML
# also make image links relative to root dir
for dir in $(ls $OUT_DIR/guides); do
    rdiscount $OUT_DIR/guides/$dir/README.md | sed 's/<img src="/<img src="guides\/'$dir'\//;' > $OUT_DIR/guides/$dir/index.html
    rm $OUT_DIR/guides/$dir/README.md
done

