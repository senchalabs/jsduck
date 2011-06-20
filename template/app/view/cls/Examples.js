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

                    var inlineEg = Ext.getCmp('inlineCodeExample');

                    Ext.Ajax.request({
                        method  : 'GET',
                        url     : 'doc-resources/' + record.data.id,
                        headers : { 'Content-Type' : 'application/json' },

                        success : function(response, opts) {
                            // inlineEg.setHeight(inlineEg.codeEditor.body.getHeight());
                            inlineEg.codeEditor.setValue(response.responseText);

                            window.frames['egIframe'].refreshPage(inlineEg.codeEditor.getValue(), inlineEg.cssEditor.getValue());
                        },
                        failure : function(response, opts) {
                        }
                    });
                }
            }

        },
        {
            region: 'center',
            padding: '10',
            xtype: 'inlineexample'
        }
    ]
});
