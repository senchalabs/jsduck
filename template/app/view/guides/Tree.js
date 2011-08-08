/**
 * The guides tree
 */
Ext.define('Docs.view.guides.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.guidetree',

    initComponent: function() {
        this.root = {
            allowDrag: false,
            children: [],
            text: 'Guides'
        };

        Ext.Array.each(Docs.data.guides, function(group) {
            var children = Ext.Array.map(group.items, function(guide) {
                return {
                    leaf: true,
                    text: guide.title,
                    url: '/guide/' + guide.name,
                    iconCls: 'icon-guide'
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
