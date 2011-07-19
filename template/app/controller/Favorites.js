/**
 * Controller for favorites.
 *
 * Syncronizes favorites store, grid and favorites markings in grid.
 */
Ext.define('Docs.controller.Favorites', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'panel',
            selector: 'favoritespanel'
        },
        {
            ref: 'tree',
            selector: 'classtree'
        }
    ],

    requires: [
        'Docs.Favorites',
        'Docs.Settings'
    ],

    init: function() {
        this.control({
            'favoritespanel': {
                resize: function(cmp, w, h) {
                    Docs.Settings.set('favorites-height', h);
                }
            },
            'favoritespanel > classgrid': {
                closeclick: function(url) {
                    Docs.Favorites.remove(url);
                },
                reorder: function() {
                    Docs.Favorites.saveOrder();
                }
            },
            'classtree': {
                addfavorite: function(url, title) {
                    Docs.Favorites.add(url, title);
                },
                removefavorite: function(url) {
                    Docs.Favorites.remove(url);
                }
            }
        });

        Docs.Favorites.on({
            add: function(url) {
                // Show favorites when first favorite added
                if (Docs.Favorites.getCount() > 0) {
                    this.getPanel().show();
                }
                // Add favorite marking to tree
                this.getTree().setFavorite(url, true);
            },
            remove: function(url) {
                // Hide favorites when favorites list empty
                if (Docs.Favorites.getCount() === 0) {
                    this.getPanel().hide();
                }
                // remove favorite marking from tree
                this.getTree().setFavorite(url, false);
            },
            scope: this
        });
    }

});