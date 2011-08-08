/**
 * The examples tree
 */
Ext.define('Docs.view.examples.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.exampletree',

    initComponent: function() {
        this.root = {
            allowDrag: false,
            children: [],
            text: 'Examples'
        };

        Ext.Array.each(Docs.data.examples, function(group) {
            var children = Ext.Array.map(group.items, function(sample) {
                return {
                    leaf: true,
                    text: sample.text,
                    url: '/example/' + sample.url,
                    iconCls: 'icon-example'
                };
            });

            this.root.children.push({
                text: group.title,
                children: children,
                iconCls: 'icon-pkg'
            });
        }, this);

        this.callParent();
    }
});
