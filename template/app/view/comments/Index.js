/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],

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
        this.initCookies();

        Ext.get('comment-index-container').mask();
    },

    /**
     * Loops through each of the filter values (manually set for now) and checked for a previous set cookie value.
     */
    initCookies: function() {
        var checkboxes = ['hideRead', 'hideCurrentUser', 'sortByScore'],
            ln = checkboxes.length,
            i, el;

        for (i = 0; i < ln; i++) {
            name = checkboxes[i];
            el = Ext.get(name);
            if (el) {
                el.dom.checked = Boolean(Ext.util.Cookies.get(name));
            }
        }
    },

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
