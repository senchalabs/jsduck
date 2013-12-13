/**
 * View for showing topics (classes, members, guides, ...).
 */
Ext.define('Docs.view.comments.Targets', {
    alias: "widget.commentsTargets",
    extend: 'Ext.panel.Panel',
    componentCls: "comments-targets",
    requires: [
        "Docs.Comments",
        "Docs.view.SimpleSelectBehavior",
        "Docs.view.comments.FilterField"
    ],

    layout: "border",

    /**
     * @event select
     * Fired when target is selected from list.
     * @param {Ext.data.Model} target  The selected target
     * or undefined when no target selected.
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
                            emptyText: "Filter topics by name...",
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
                    fields: ["id", "type", "cls", "member", "score", "text"]
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{score}</span>',
                            '<span class="target">{text}</span>',
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
        this.fetchTargets();
    },

    onFilter: function(pattern) {
        this.list.getSelectionModel().deselectAll();
        this.list.getStore().clearFilter(true);
        this.list.getStore().filter({property: "text", value: pattern, anyMatch: true});
    },

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.list.getSelectionModel().deselectAll();
    },

    onSelect: function(target) {
        this.fireEvent("select", target);
    },

    onDeselect: function() {
        this.fireEvent("select", undefined);
    },

    fetchTargets: function(sortBy) {
        Docs.Comments.request("jsonp", {
            url: '/targets',
            method: 'GET',
            success: this.loadTargets,
            scope: this
        });
    },

    loadTargets: function(targets) {
        this.list.getStore().loadData(Ext.Array.map(targets, this.convertTarget, this));
    },

    // Adds text field to target record.
    convertTarget: function(t) {
        if (t.type === "class") {
            t.text = t.cls + (t.member ? "#"+t.member.replace(/^.*-/, "") : "");
        }
        else {
            t.text = t.type + " " + t.cls;
        }
        return t;
    }
});
