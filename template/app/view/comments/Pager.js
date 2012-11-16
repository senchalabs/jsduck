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
             * @event loadMore
             * Fired when the link clicked to load more comments.
             * @param {Number} offset Index offset to the next page of
             * comments to load.
             */
            this.fireEvent("loadMore", this.offset + this.limit);
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
        Ext.apply(this, cfg);
        this.update(this.getPagerHtml());
    },

    /**
     * Resets comment count to zero.
     */
    reset: function() {
        this.update("<span></span>No comments found.");
    },

    getPagerHtml: function() {
        var total = this.total_rows || 0;
        var loaded = this.offset + this.limit;
        var next_load = Math.min(this.limit, total - loaded);

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
