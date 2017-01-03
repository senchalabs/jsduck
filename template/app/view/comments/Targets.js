/**
 * View for showing topics (classes, members, guides, ...).
 */
Ext.define('Docs.view.comments.Targets', {
    extend: 'Docs.view.comments.TopList',
    alias: "widget.commentsTargets",
    requires: ["Docs.model.Target"],

    model: "Docs.model.Target",
    displayField: "text",
    filterEmptyText: "Filter topics by name..."
});
