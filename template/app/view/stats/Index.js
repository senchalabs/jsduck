/**
 * The statistics page.
 */
Ext.define('Docs.view.stats.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.statsindex',
    requires: [
        'Ext.grid.Panel',
        'Docs.model.Stats'
    ],
    layout: "fit",

    initComponent: function() {
        var store = Ext.create('Ext.data.Store', {
            model: 'Docs.model.Stats',
            data: Docs.data.stats,
            sorters: "name"
        });
        Ext.QuickTips.init();
        this.items = [{
            xtype: 'grid',
            store: store,
            title: 'Statistics',
            columns: [
                {
                    text: 'Name',
                    width: 200,
                    dataIndex: 'name'
                },
                {
                    text: 'Members',
                    width: 70,
                    dataIndex: 'members'
                },
                {
                    text: 'Local members',
                    width: 100,
                    dataIndex: 'localMembers'
                },
                {
                    text: 'Fan-in',
                    width: 70,
                    dataIndex: 'fanIn'
                },
                {
                    text: 'Fan-out',
                    flex: 1,
                    dataIndex: 'fanOut'
                }
            ]
        }];

        this.callParent(arguments);
    },

    /**
     * Returns tab config for the stats page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.data.stats.length > 0 ? {cls: 'stats', href: '#!/stats', tooltip: 'Statistics'} : false;
    }
});
