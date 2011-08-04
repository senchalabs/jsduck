/**
 * View showing a list of guides.
 */
Ext.define('Docs.view.guides.List', {
    extend: 'Ext.view.View',
    alias: 'widget.guidespanel',

    cls: 'demos',
    itemSelector: 'dl',

    tpl: Ext.create('Ext.XTemplate',
        '<div id="sample-ct">',
            '<tpl for=".">',
            '<div><a name="{url}"></a><h2><div>{group}</div></h2>',
            '<dl>',
                '<tpl for="guides">',
                    '<dd ext:url="guide/{name}"><img src="guides/{name}/icon-lg.png"/>',
                        '<div><h4>{title}</h4><p>{description}</p></div>',
                    '</dd>',
                '</tpl>',
            '<div style="clear:left"></div></dl></div>',
            '</tpl>',
        '</div>',
        {
            isExperimental: function(status) {
                return status === 'experimental';
            }
        }
    ),

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when an guide is clicked
             * @param {String} url  URL of the guide to load
             */
            'guideclick'
        );

        this.on({
            'afterrender': function(cmp) {
                cmp.el.addListener('mouseover', function(evt, el) {
                    Ext.get(el).addCls('over');
                }, this, {
                    delegate: 'dd'
                });
                cmp.el.addListener('mouseout', function(evt, el) {
                    Ext.get(el).removeCls('over');
                }, this, {
                    delegate: 'dd'
                });
            }
        });

        this.callParent(arguments);
    },

    onContainerClick: function(e) {
        var group = e.getTarget('h2', 3, true);

        if (group) {
            group.up('div').toggleCls('collapsed');
        }
    },

    onItemClick : function(record, item, index, e){
        var t = e.getTarget('dd', 5, true);

        if (t && !e.getTarget('a', 2)) {
            var url = t.getAttributeNS('ext', 'url');
            this.fireEvent('guideclick', url);
        }

        return this.callParent(arguments);
    }
});
