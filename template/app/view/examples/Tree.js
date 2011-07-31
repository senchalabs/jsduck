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

        this.root = {
            allowDrag: false,
            children: [],
            text: 'Examples'
        };

        Ext.Array.each(Ext.samples.samplesCatalog, function(sampleGroup) {

            var children = Ext.Array.map(sampleGroup.samples, function(sample) {
                return Ext.apply(sample, { leaf: true })
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
        Ext.getCmp('card-panel').layout.setActiveItem('example');
        Ext.get('exampleIframe').dom.setAttribute('src', 'extjs/examples/' + node.raw.url)
    }
});
