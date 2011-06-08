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

    initComponent: function() {
        this.addEvents(
            /**
             * @event classselect
             * Fired when class in grid selected.
             * @param {String} name  Name of the class that was selected. For example "Ext.Ajax".
             */
            "classselect",
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
            },
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
        ];

        this.callParent(arguments);

        this.getSelectionModel().on("select", function(sm, r) {
            this.fireEvent("classselect", r.get("cls"));
        }, this);
    },

    /**
     * Selects class if grid contains such class.
     * Fires no events while selecting.
     * @param {String} cls  class name.
     */
    selectClass: function(cls) {
        var index = this.getStore().findExact('cls', cls);
        if (index > -1) {
            this.getSelectionModel().select(index, false, true);
        }
        else {
            this.getSelectionModel().deselectAll(true);
        }
    }

});
