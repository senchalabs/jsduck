/**
 * The comments expander, showing the number of comments.
 */
Ext.define('Docs.view.comments.Expander', {
    extend: 'Ext.Component',

    /**
     * @cfg {String} type
     * One of: "class", "guide", "video".
     */
    type: "class",

    /**
     * @cfg {String} className
     */
    /**
     * @cfg {String} memberId
     */
    /**
     * @cfg {Number} count
     */

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<div class="comments-div first-child" id="comments-{id}">',
                '<a href="#" class="side toggleComments"><span></span></a>',
                '<a href="#" class="name toggleComments">',
                    '<tpl if="loading">',
                        '<div class="loading">Loading...</div>',
                    '<tpl else>',
                        '<tpl if="count &gt; 0">',
                            'View {[values.count == 1 ? "1 comment" : values.count + " comments"]}',
                        '<tpl else>',
                            'No comments. Click to add',
                        '</tpl>',
                    '</tpl>',
                '</a>',
            '</div>'
        );

        this.data = this.prepareData();

        this.callParent(arguments);
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.count = count;
        this.update(this.prepareData());
    },

    prepareData: function() {
        var cls = this.type + '-' + this.className.replace(/\./g, '-');

        return {
            id: this.memberId ? cls+"-"+this.memberId : cls,
            count: this.count
        };
    }

});
