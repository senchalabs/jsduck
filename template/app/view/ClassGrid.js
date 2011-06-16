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
             * @event classclick
             * Fired when class in grid clicked.
             * @param {String} name  Name of the class that was selected. For example "Ext.Ajax".
             * @param {Ext.EventObject} e
             */
            "classclick",
            /**
             * @event closeclick
             * Fired when close button in grid clicked.
             * @param {String} name  Name of the class that was closed. For example "Ext.Ajax".
             */
            "closeclick"
        );

        this.columns = [
            {
                width: 18,
                dataIndex: 'cls',
                renderer: function(cls, data) {
                    data.tdCls = this.icons[cls];
                },
                scope: this
            },
            {
                dataIndex: 'cls',
                flex: true
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
                        this.fireEvent("closeclick", this.getStore().getAt(rowIndex).get("cls"));
                    },
                    scope: this
                }
            ]);
        }

        this.callParent(arguments);

        // Prevent item from becoming selected right away, because the
        // the click event that follows can possibly cause the class
        // to be loaded in another window, in which case the selection
        // of the clicked-on item should not happen.  When it needs to
        // be selected, the #showClass method in Class controller will
        // explicitly call #selectClass.
        this.on("beforeselect", function() {
            return false;
        }, this);

        this.on("itemclick", function(view, record, item, index, event) {
            // Don't fire classclick when close button clicked
            if (!event.getTarget("img")) {
                this.fireEvent("classclick", record.get("cls"), event);
            }
        }, this);

        // Initialize selection after rendering
        this.on("afterrender", function() {
            this.selectClass(this.selectedClass);
        }, this);
    },

    /**
     * Selects class if grid contains such class.
     * Fires no events while selecting.
     * @param {String} cls  class name.
     */
    selectClass: function(cls) {
        this.selectedClass = cls;
        // when grid hasn't been rendered yet, trying to select will give us error.
        if (this.rendered) {
            var index = this.getStore().findExact('cls', cls);
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
