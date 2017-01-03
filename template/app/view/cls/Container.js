/**
 * The class documentation page. Consists of the header (class name) and tab panel.
 * TODO: Add framework version
 */
Ext.define('Docs.view.cls.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.classcontainer',
    requires: [
        'Docs.view.cls.Header',
        'Docs.view.cls.Overview'
    ],

    layout: 'border',

    padding: '5 10 0 10',

    initComponent: function() {
        this.items = [
            Ext.create('Docs.view.cls.Header', {
                region: 'north'
            }),
            Ext.create('Docs.view.cls.Overview', {
                region: 'center'
            })
        ];
        this.callParent(arguments);
    }
});