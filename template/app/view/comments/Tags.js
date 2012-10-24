/**
 * View for showing tags.
 */
Ext.define('Docs.view.comments.Tags', {
    extend: 'Docs.view.comments.TopList',
    alias: "widget.commentsTags",
    requires: ["Docs.model.Tag"],

    model: "Docs.model.Tag",
    displayField: "tagname",
    filterEmptyText: "Filter tags by name..."
});
