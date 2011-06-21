Ext.define('Docs.view.cls.Examples', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.classexamples',

    cls: 'iScroll',
    title: 'Examples',
    autoScroll: true,

    layout: 'border',

    items: [
        {
            region: 'west',
            html: 'west',
            width: 200,
            xtype: 'gridpanel',
            store: Ext.getStore('Examples'),
            padding: '10',
            columns: [
                {
                    text: 'Example',
                    dataIndex: 'title',
                    flex: true
                }
            ],

            listeners: {
                itemclick: function(view, record, item, index, event) {
                    Ext.getCmp('inlineCodeExample').showExample(record.data.location);
                }
            }

        },
        {
            region: 'center',
            padding: '10',
            id: 'inlineCodeExample',
            xtype: 'inlineexample'
        }
    ]
});
