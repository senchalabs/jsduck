/**
 * Base view class for Tags and Targets.
 */
Ext.define('Docs.view.comments.TopList', {
    extend: 'Ext.panel.Panel',
    componentCls: "comments-toplist",
    requires: [
        "Docs.view.SimpleSelectBehavior",
        "Docs.view.comments.FilterField"
    ],

    layout: "border",

    /**
     * @cfg {Ext.data.Model} model
     * A model for records in the store that's used for the list.
     * It should also define the URL from which to load the store.
     */

    /**
     * @cfg
     * Name of the model field to be shown in our list as the textual
     * description of the item.  This is also used for filtering the
     * list of items.
     */
    displayField: "text",

    /**
     * @cfg
     * Name of the field containing the nr of comments an item has.
     */
    scoreField: "score",

    /**
     * @cfg
     * Text to show in empty filter field.
     */
    filterEmptyText: "Filter by name...",

    /**
     * @event select
     * Fired when item is selected from list.
     * @param {Ext.data.Model} record  The selected record
     * or undefined when no item selected.
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
                            emptyText: this.filterEmptyText,
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
                cls: "iScroll top-list",
                autoScroll: true,
                store: new Ext.data.Store({
                    model: this.model
                }),
                allowDeselect: true,
                tpl: [
                    '<ul>',
                    '<tpl for=".">',
                        '<li>',
                            '<span class="score">{'+this.scoreField+'}</span>',
                            '<span class="text">{'+this.displayField+'}</span>',
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
        this.list.getStore().load();
    },

    onFilter: function(pattern) {
        this.list.getSelectionModel().deselectAll();
        this.list.getStore().clearFilter(true);
        this.list.getStore().filter({property: this.displayField, value: pattern, anyMatch: true});
    },

    /**
     * Clears the selection.
     */
    deselectAll: function() {
        this.list.getSelectionModel().deselectAll();
    },

    onSelect: function(record) {
        this.fireEvent("select", record);
    },

    onDeselect: function() {
        this.fireEvent("select", undefined);
    }

});
