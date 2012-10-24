/**
 * View for showing tags.
 */
Ext.define('Docs.view.comments.Tags', {
    alias: "widget.commentsTags",
    extend: 'Ext.panel.Panel',
    componentCls: "comments-tags",
    requires: [
        "Docs.Comments",
        "Docs.view.SimpleSelectBehavior",
        "Docs.view.comments.FilterField"
    ],

    layout: "border",

    /**
     * @event select
     * Fired when tag is selected from list.
     * @param {Ext.data.Model} tag  The selected tag
     * or undefined when no tag selected.
     */

    initComponent: function() {
        this.items = [
            this.tabpanel = Ext.widget("tabpanel", {
                plain: true,
                region: "north",
                height: 50,
                items: [
                    {
                        title: "By comment count"
                    }
                ],
                dockedItems: [
                    {
                        dock: "bottom",
                        items: [{
                            xtype: "commentsFilterField",
                            emptyText: "Filter tags by name...",
                            width: 320,
                            height: 20,
                            listeners: {
                                filter: this.onFilter,
                                scope: this
                            }
                        }]
                    }
                ]
            }),
            this.list = Ext.widget("dataview", {
                region: "center",
                cls: "iScroll targets-list",
                autoScroll: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ["tagname", "score"]
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{score}</span>',
                            '<span class="target">{tagname}</span>',
                        '</li>',
                    '</tpl>',
                    '</ul>'
                ],
                itemSelector: "li"
            })
        ];

        new Docs.view.SimpleSelectBehavior(this.list, {
            select: this.onSelect,
            deselect: this.onDeselect,
            scope: this
        });

        this.callParent(arguments);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.fetchTags();
    },

    onFilter: function(pattern) {
        this.list.getSelectionModel().deselectAll();
        this.list.getStore().clearFilter(true);
        this.list.getStore().filter({property: "tagname", value: pattern, anyMatch: true});
    },

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.list.getSelectionModel().deselectAll();
    },

    onSelect: function(tag) {
        this.fireEvent("select", tag);
    },

    onDeselect: function() {
        this.fireEvent("select", undefined);
    },

    fetchTags: function(sortBy) {
        Docs.Comments.request("jsonp", {
            url: '/tags',
            method: 'GET',
            success: this.loadTags,
            scope: this
        });
    },

    loadTags: function(tags) {
        this.list.getStore().loadData(tags.data);
    }
});
