/**
 * The examples tree
 */
Ext.define('Docs.view.examples.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.examplestree',

    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {

        this.addEvents(
            /**
             * @event
             * Fired when link in tree was clicked on and needs to be loaded.
             * @param {String} url  URL of the example to load
             * @param {Ext.EventObject} e
             */
            "exampleclick"
        );

        this.root = {
            allowDrag: false,
            children: [],
            text: 'Examples'
        };

        Ext.Array.each(Ext.samples.samplesCatalog, function(sampleGroup) {

            var children = Ext.Array.map(sampleGroup.samples, function(sample) {
                return Ext.apply(sample, {
                    leaf: true,
                    url: '/examples/' + sample.url
                });
            });

            this.root.children.push({
                text: sampleGroup.title,
                children: children,
                expanded: true
            })
        }, this);

        this.on("itemclick", this.onItemClick, this);

        this.callParent();
    },

    onItemClick: function(view, node, item, index, e) {

        var url = node.raw.url;

        if (url) {
            this.fireEvent('exampleclick', url, e)
        }
        else if (!node.isLeaf()) {
            if (node.isExpanded()) {
                node.collapse(false);
            }
            else {
                node.expand(false);
            }
        }
    }
});
