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
            ref: "classOverview",
            selector: "classoverview"
        }
    ],

    init: function() {
        Docs.Comments.on("countChange", this.updateCounts, this);
    },

    updateCounts: function(target, count) {
        this.getClassOverview().updateCommentCounts();
    }

});
