/**
 * TabPanel with favorites grid
 */
Ext.define('Docs.view.FavoritesPanel', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Docs.view.ClassGrid',
        'Docs.Favorites',
        'Docs.Settings'
    ],
    alias: 'widget.favoritespanel',

    padding: '2 4 0 0',
    bodyPadding: '3 15 0 12',
    border: false,
    plain: true,
    split: true,

    initComponent: function() {
        this.items = [
            {
                xtype: 'classgrid',
                id: 'favorites-grid',
                title: 'Favorites',
                iconCls: 'icon-fav',
                viewConfig: {
                    plugins: [{
                        pluginId: 'favGridDD',
                        ptype: 'gridviewdragdrop',
                        animate: true,
                        dragText: 'Drag and drop to reorganize'
                    }],
                    listeners: {
                        drop: function() {
                            // Hack to fix a bug in localStorage which prevents the order of
                            // items being saved when they're changed
                            var store = Ext.getStore('Favorites');
                            store.getProxy().setIds(Ext.Array.map(store.data.items, function(i) { return i.data.id; }));
                        }
                    }
                },
                store: Ext.getStore('Favorites'),
                icons: Docs.icons,
                listeners: {
                    closeclick: function(cls) {
                        Docs.Favorites.remove(cls);
                    },
                    // Prevent row highlighting when doing drag-drop
                    afterrender: function() {
                        var ddPlugin = this.getView().getPlugin('favGridDD');

                        ddPlugin.dragZone.onInitDrag = function() {
                            Ext.getCmp('favorites-grid').addCls('drag');
                            Ext.view.DragZone.prototype.onInitDrag.apply(this, arguments);
                        };
                        ddPlugin.dragZone.afterValidDrop = ddPlugin.dragZone.afterInvalidDrop = function() {
                            Ext.getCmp('favorites-grid').removeCls('drag');
                        };
                    }
                }
            }
        ];

        this.on({
            afterRender: function() {
                // Add 7px padding at left side of tab-bar
                this.tabBar.insert(0, {width: 7, xtype: 'container'});
            },
            resize: function(cmp, w, h) {
                Docs.Settings.set('favorites-height', h);
            }
        });

        Docs.Favorites.on({
            add: function() {
                if (Docs.Favorites.getCount() > 0) {
                    this.show();
                }
            },
            remove: function() {
                if (Docs.Favorites.getCount() === 0) {
                    this.hide();
                }
            },
            scope: this
        });

        this.callParent();
    }

});
