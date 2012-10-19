/**
 * Retrieving and posting Comments
 */
Ext.define('Docs.controller.CommentCounts', {
    extend: 'Ext.app.Controller',

    requires: [
        "Docs.Comments"
    ],

    refs: [
        {
            ref: "class",
            selector: "classoverview"
        },
        {
            ref: 'guide',
            selector: '#guide'
        },
        {
            ref: 'video',
            selector: '#video'
        }
    ],

    init: function() {
        Docs.Comments.on("countChange", this.updateCounts, this);
    },

    updateCounts: function(target, count) {
        this.getClass().updateCommentCounts();
        this.getGuide().updateCommentCounts();
        this.getVideo().updateCommentCounts();
    }

});
