/**
 * A tree for guides/videos/examples.
 *
 * Each of these has similar dataset that consists of groups.
 * Only the actual items (that are grouped) differ.
 * This class applies a conversion function for each item.
 */
Ext.define('Docs.view.GroupTree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.grouptree',

    /**
     * @cfg {Object[]} data (required)
     * An array of guoups. Each group is object with properties:
     * @cfg {String} title
     * @cfg {Object[]} items
     */

    /**
     * @cfg {Function} convert (required)
     * A function that converts items to tree nodes
     * @cfg {Object} convert.item The item to convert
     * @cfg {Object} convert.return The treenode config
     */

    initComponent: function() {
        this.root = {
            children: [],
            text: 'Root'
        };

        Ext.Array.each(this.data, function(group) {
            this.root.children.push({
                text: group.title,
                expanded: true,
                children: Ext.Array.map(group.items, this.convert),
                iconCls: 'icon-pkg'
            });
        }, this);
        this.callParent();
    }
});
/**
 * Ti change -- Special kind of group tree to display nested guides
 */
Ext.define('Docs.view.GuidesGroupTree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.guidesgrouptree',

    /**
     * @cfg {Object[]} data (required)
     * An array of guoups. Each group is object with properties:
     * @cfg {String} title
     * @cfg {Object[]} items
     */

    /**
     * @cfg {Function} convert (required)
     * A function that converts items to tree nodes
     * @cfg {Object} convert.item The item to convert
     * @cfg {Object} convert.return The treenode config
     */
    initComponent: function() {
        this.root = {
            children: Ext.Array.map(this.data, this.convert),
            text: 'Root'
        };
        // expand top-level guides
        Ext.Array.each(this.root.children, function(guide){guide.expanded = true;})
        this.callParent();
    }
});
