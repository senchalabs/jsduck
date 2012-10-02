/**
 * A comment model.
 */
Ext.define('Docs.model.Comment', {
    extend: 'Ext.data.Model',
    fields: [
        {name: "id", mapping: "_id"},
        "author",
        "emailHash",
        "moderator",
        "createdAt",
        "target",
        "score",
        "upVote",
        "downVote",
        "contentHtml",
        "read",
        "deleted"
    ],
    proxy: {
        type: "ajax",
        reader: "json"
    }
});
