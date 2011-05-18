/**
 * The class documentation page. Consists of the header (class name) and class panel.
 * TODO: Add framework version
 */
Ext.define('Docs.view.class.Show', {
    extend: 'Ext.container.Container',
    alias: 'widget.showclass',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        this.items = [
            Ext.create('Docs.view.class.Header', {
                docClass: this.docClass
            }),
            Ext.create('Docs.view.class.Panel', {
                docClass: this.docClass,
                flex: 1
            })
        ];
        this.callParent(arguments);
    }
});
