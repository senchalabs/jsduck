/**
 * Renders the pager for FullList view of comments.
 */
Ext.define('Docs.view.comments.Pager', {
    extend: 'Ext.Component',
    alias: "widget.commentsPager",
    componentCls: "recent-comments-pager",

    afterRender: function() {
        this.callParent(arguments);
        this.getEl().on("click", function() {
            /**
             * @event click
             * Fired when the link clicked to load more comments.
             */
            this.fireEvent("click");
        }, this, {preventDefault: true, delegate: "a.fetchMoreComments"});
    },

    /**
     * Updates the display of pager with the data from previous load.
     *
     * @param {Object} cfg
     * @param {Object} cfg.offset
     * @param {Object} cfg.limit
     * @param {Object} cfg.total_rows
     */
    configure: function(cfg) {
        this.update(this.getPagerHtml(cfg));
    },

    getPagerHtml: function(cfg) {
        var total = cfg.total_rows || 0;
        var loaded = cfg.offset + cfg.limit;
        var next_load = Math.min(cfg.limit, total - loaded);

        if (total > loaded) {
            return [
                '<span></span>',
                '<a href="#" class="fetchMoreComments" rel="' + loaded + '">',
                    'Showing comments 1-' + loaded + ' of ' + total + '. ',
                    'Click to load ' + next_load + ' more...',
                '</a>'
            ].join('');
        }
        else {
            return '<span></span>That\'s all. Total '+total+' comments.';
        }
    }

});
