Ext.define('Docs.SourceCodePanel', {
    extend: 'Ext.panel.Panel',

    id: 'doc-source',
    title: 'Source',
    autoScroll: true,
    listeners: {
        activate: function(a,b,c) {
            var self = this;

            var url = Docs.App.getBaseUrl() + '/source/' + req.source,
                idx = url.indexOf('#');
            if (idx) {
                url = url.substr(0, idx);
            }

            Ext.Ajax.request({
                method  : 'GET',
                url     : url + '?plain=1',

                success : function(response, opts) {
                    self.update('<pre class="prettyprint">' + response.responseText + '</pre>');
                    prettyPrint();
                },
                failure : function(response, opts) {
                  console.log('Fail');
                }
            });
        }
    }
});
