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
                tooltip: 'Delete'
            }
        ];

        this.callParent(arguments);
    }

});
