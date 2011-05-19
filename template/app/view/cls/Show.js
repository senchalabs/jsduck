/**
 * The class documentation page. Consists of the header (class name) and class panel.
 * TODO: Add framework version
 */
Ext.define('Docs.view.cls.Show', {
    extend: 'Ext.container.Container',
    alias: 'widget.showclass',
    requires: [
        'Docs.view.cls.Header',
        'Docs.view.cls.Panel'
    ],
    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        this.items = [
            Ext.create('Docs.view.cls.Header', {
                docClass: this.docClass
            }),
            Ext.create('Docs.view.cls.Panel', {
                docClass: this.docClass,
                flex: 1
            })
        ];
        this.callParent(arguments);
    }
});
