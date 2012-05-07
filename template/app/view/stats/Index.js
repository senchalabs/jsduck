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
                    text: 'Configs',
                    width: 50,
                    align: 'right',
                    dataIndex: 'local_cfgs'
                },
                {
                    text: 'Props',
                    width: 50,
                    align: 'right',
                    dataIndex: 'local_properties'
                },
                {
                    text: 'Methods',
                    width: 50,
                    align: 'right',
                    dataIndex: 'local_methods'
                },
                {
                    text: 'Events',
                    width: 50,
                    align: 'right',
                    dataIndex: 'local_events'
                },
                {
                    text: 'Members',
                    width: 50,
                    align: 'right',
                    dataIndex: 'local_members',
                    renderer: function(v) {
                        return "<b>"+v+"</b>";
                    }
                },

                {
                    text: 'All Configs',
                    width: 50,
                    align: 'right',
                    dataIndex: 'total_cfgs'
                },
                {
                    text: 'All Props',
                    width: 50,
                    align: 'right',
                    dataIndex: 'total_properties'
                },
                {
                    text: 'All Methods',
                    width: 50,
                    align: 'right',
                    dataIndex: 'total_methods'
                },
                {
                    text: 'All Events',
                    width: 50,
                    align: 'right',
                    dataIndex: 'total_events'
                },
                {
                    text: 'All Members',
                    width: 50,
                    align: 'right',
                    dataIndex: 'total_members',
                    renderer: function(v) {
                        return "<b>"+v+"</b>";
                    }
                },

                {
                    text: 'Fan-in',
                    width: 50,
                    align: 'right',
                    dataIndex: 'fanIn'
                },
                {
                    text: 'Fan-out',
                    width: 50,
                    align: 'right',
                    dataIndex: 'fanOut'
                },

                {
                    text: 'Class word-count',
                    width: 50,
                    align: 'right',
                    dataIndex: 'class_wc'
                },
                {
                    text: 'Members word-count',
                    width: 50,
                    align: 'right',
                    dataIndex: 'members_wc'
                },
                {
                    text: 'wc / member',
                    width: 50,
                    align: 'right',
                    dataIndex: 'wc_per_member'
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
        var enabled = (Docs.data.stats || []).length > 0;
        return enabled ? {cls: 'stats', href: '#!/stats', tooltip: 'Statistics', text: 'Stats'} : false;
    }
});
