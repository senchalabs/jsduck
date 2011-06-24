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
            width: 200,
            xtype: 'gridpanel',
            store: 'Examples',
            cmpName: 'examplelist',
            padding: '10',
            columns: [
                {
                    text: 'Example',
                    dataIndex: 'title',
                    flex: true
                }
            ]
        },
        {
            region: 'center',
            padding: '10',
            id: 'inlineCodeExample',
            xtype: 'inlineexample'
        }
    ]
});
