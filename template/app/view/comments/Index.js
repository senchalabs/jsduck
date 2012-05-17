/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],
    requires: ['Docs.Settings'],

    cls: 'comment-index',
    margin: '10 0 0 0',
    layout: 'fit',

    dockedItems: [
        {
            xtype: 'component',
            dock: 'top',
            html: [
                '<h1>Recent Comments</h1>'
            ].join(" ")
        },
        {
            xtype: 'container',
            dock: 'left',
            width: 200,
            html: [
                '<ul id="comment-index-controls">',
                    '<li><label><input type="checkbox" name="hideRead" id="hideRead" /> Hide read</label></li>',
                    '<li><label><input type="checkbox" name="hideCurrentUser" id="hideCurrentUser" /> Hide current User</label></li>',
                    '<li><label><input type="checkbox" name="sortByScore" id="sortByScore" /> Sort by score</label></li>',
                '</ul>'
            ].join(" ")
        }
    ],

    items: [
        {
            cls: 'iScroll',
            id: 'comment-index-container',
            autoScroll: true,
            items: [
                {
                    xtype: 'container',
                    id: 'recentcomments'
                }
            ]
        }
    ],

    afterRender: function() {
        this.callParent(arguments);
        this.initCheckboxes();

        this.setMasked(true);
    },

    /**
     * Masks or unmasks the container
     * @param {Boolean} masked True to show mask.
     */
    setMasked: function(masked) {
        var container = Ext.get('comment-index-container');
        if (container) {
            container[masked ? "mask" : "unmask"]();
        }
    },

    // Initializes all checkboxes from settings.
    initCheckboxes: function() {
        var settings = Docs.Settings.get("comments");
        Ext.Array.forEach(['hideRead', 'hideCurrentUser', 'sortByScore'], function(id) {
            var cb = Ext.get(id);
            if (cb) {
                cb.dom.checked = settings[id];
            }
        });
    },

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
