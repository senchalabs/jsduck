/**
 * A tag model.
 */
Ext.define('Docs.model.Tag', {
    extend: 'Ext.data.Model',
    requires: ['Docs.CommentsProxy'],
    fields: [
        "tagname",
        "score"
    ],
    proxy: {
        type: "comments",
        url: "/tags",
        reader: {
            type: "json",
            root: "data"
        }
    }
});
