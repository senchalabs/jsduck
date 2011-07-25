/**
 * Gridpanel for showing list of classes.
 */
Ext.define('Docs.view.ClassGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.classgrid',
    hideHeaders: true,
    border: false,
    bodyBorder: false,

    /**
     * @cfg {Object} icons
     * Mapping of class names to icon class names.
     */
    icons: {},

    /**
     * @cfg {Boolean} enableClose
     * Show or hide the close column
     */
    enableClose: true,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when class in grid clicked.
             * @param {String} url  URL of the page that was selected. For example "/api/Ext.Ajax".
             * @param {Ext.EventObject} e
             */
            "urlclick",
            /**
             * @event
             * Fired when close button in grid clicked.
             * @param {String} url  URL of the page that was closed. For example "/api/Ext.Ajax".
             */
            "closeclick",
            /**
             * @event
             * Fired when items in grid reordered by drag-drop.
             */
            "reorder"
        );

        this.viewConfig = {
            plugins: [{
                pluginId: 'ddPlugin',
                ptype: 'gridviewdragdrop',
                animate: true,
                dragText: 'Drag and drop to reorganize'
            }],
            listeners: {
                drop: function() {
                    this.fireEvent("reorder");
                },
                scope: this
            }
        };

        this.columns = [
            {
                width: 18,
                dataIndex: 'url',
                renderer: function(url, data) {
                    data.tdCls = this.icons[url];
                },
                scope: this
            },
            {
                dataIndex: 'title',
                flex: true,
                renderer: function(title, data, r) {
                    return Ext.String.format('<a href="#{0}" rel="{0}" class="docClass">{1}</a>', r.get("url"), title);
                }
            }
        ];

        if (this.enableClose) {
            this.columns = this.columns.concat([
                {
                    xtype: 'actioncolumn',
                    width: 18,
                    icon: 'resources/images/x12.png',
                    tooltip: 'Delete',
                    handler: function(view, rowIndex) {
                        this.fireEvent("closeclick", this.getStore().getAt(rowIndex).get("url"));
                    },
                    scope: this
                }
            ]);
        }

        this.callParent(arguments);

        this.on("itemclick", function(view, record, item, index, event) {
            // Only fire urlclick when the row background is clicked
            // (that doesn't contain neither the link nor the close
            // button).
            if (!event.getTarget("img") && !event.getTarget("a")) {
                this.fireEvent("urlclick", record.get("url"), event);
            }
        }, this);

        this.on("afterrender", function() {
            // Initialize selection after rendering
            this.selectUrl(this.selectedUrl);

            // Prevent row highlighting when doing drag-drop
            var ddPlugin = this.getView().getPlugin('ddPlugin');
            var self = this;
            ddPlugin.dragZone.onInitDrag = function() {
                self.addCls('drag');
                Ext.view.DragZone.prototype.onInitDrag.apply(this, arguments);
            };
            ddPlugin.dragZone.afterValidDrop = ddPlugin.dragZone.afterInvalidDrop = function() {
                self.removeCls('drag');
            };
        }, this);
    },

    /**
     * Selects page if grid contains such.
     * Fires no events while selecting.
     * @param {String} url  page URL.
     */
    selectUrl: function(url) {
        this.selectedUrl = url;
        // when grid hasn't been rendered yet, trying to select will give us error.
        if (this.rendered) {
            var index = this.getStore().findExact('url', url);
            this.selectIndex(index);
        }
    },

    selectIndex: function(index) {
        if (index > -1) {
            this.view.focusRow(index);
            this.getSelectionModel().select(index, false, true);
        }
        else {
            this.getSelectionModel().deselectAll(true);
        }
    }

});
