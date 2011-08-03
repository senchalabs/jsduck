Ext.define('Docs.view.videos.List', {
    extend: 'Ext.view.View',
    alias: 'widget.samplepanel',

    cls          : 'demos',
    itemSelector : 'dl',

    tpl          : Ext.create('Ext.XTemplate',
        '<div id="sample-ct">',
            '<tpl for=".">',
            '<div><a name="{id}"></a><h2><div>{group}</div></h2>',
            '<dl>',
                '<tpl for="videos">',
                    '<dd ext:id="{id}"><img src="{thumb}"/>',
                        '<div><h4>{title}',
                        '</h4><p>{[values.description.substr(0,100)]}</p></div>',
                    '</dd>',
                '</tpl>',
            '<div style="clear:left"></div></dl></div>',
            '</tpl>',
        '</div>', {
         desc: function(status){
             return status == 'experimental';
         }
    }),

    initComponent: function() {
        /**
         * @event
         * Fired when an example is clicked
         * @param {String} url  URL of the example to load
         * @param {Ext.EventObject} e
         */
        this.addEvents('exampleclick');

        this.on({
            'afterrender': function(cmp) {
                cmp.el.addListener('mouseover', function(evt, el) {
                    Ext.get(el).addCls('over')
                }, this, {
                    delegate: 'dd'
                });
                cmp.el.addListener('mouseout', function(evt, el) {
                    Ext.get(el).removeCls('over')
                }, this, {
                    delegate: 'dd'
                });
            }
        })

        this.callParent(arguments);
    }

    // onContainerClick: function(e) {
    //     var group = e.getTarget('h2', 3, true);
    //
    //     if (group) {
    //         group.up('div').toggleCls('collapsed');
    //     }
    // },
    //
    // onItemClick : function(record, item, index, e){
    //     var t = e.getTarget('dd', 5, true);
    //
    //     if (t && !e.getTarget('a', 2)) {
    //         var url = t.getAttributeNS('ext', 'url');
    //         this.fireEvent('exampleclick', url);
    //     }
    //
    //     return this.callParent(arguments);
    // }
});