/**
 * TabPanel with favorites grid
 */
Ext.define('Docs.view.FavoritesPanel', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Docs.view.ClassGrid',
        'Docs.Favorites'
    ],
    alias: 'widget.favoritespanel',

    padding: '2 4 0 0',
    bodyPadding: '3 15 0 12',
    border: false,
    plain: true,
    split: true,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when favorites reordered in grid.
             * @param {String} url  The URL of the favorited page.
             */
            "reorder"
        );

        this.items = [
            {
                xtype: 'classgrid',
                id: 'favorites-grid',
                title: 'Favorites',
                iconCls: 'icon-fav',
                store: Ext.getStore('Favorites'),
                icons: Docs.icons
            }
        ];

        this.on({
            afterRender: function() {
                // Add 7px padding at left side of tab-bar
                this.tabBar.insert(0, {width: 7, xtype: 'container'});
            }
        });

        this.callParent();
    }

});
