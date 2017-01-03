/**
 * DragZone for comments drag-drop reorganization.
 */
Ext.define("Docs.view.comments.DragZone", {
    extend: 'Ext.dd.DragZone',

    constructor: function(view, config) {
        this.view = view;
        this.callParent([view.getEl(), config]);
    },

    getDragData: function(e) {
        var avatarEl = e.getTarget("img.drag-handle", 10);
        if (avatarEl) {
            var sourceEl = Ext.fly(avatarEl).up(this.view.itemSelector).dom;
            return {
                sourceEl: sourceEl,
                repairXY: Ext.fly(sourceEl).getXY(),
                ddel: this.cloneCommentEl(sourceEl),
                comment: this.view.getRecord(sourceEl)
            };
        }
        return false;
    },

    cloneCommentEl: function(el) {
        var clone = el.cloneNode(true);
        // hide the list of replies, we don't want to drag such a huge object.
        var replies = Ext.fly(clone).down(".comments-list-with-form");
        replies && replies.remove();
        // generate new ID
        clone.id = Ext.id();
        return clone;
    },

    getRepairXY: function() {
        return this.dragData.repairXY;
    }
});
