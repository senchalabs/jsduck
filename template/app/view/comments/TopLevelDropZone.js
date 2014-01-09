/**
 * DropZone for dragging comments to the topmost level (removing the
 * parent completely).
 */
Ext.define("Docs.view.comments.TopLevelDropZone", {
    extend: 'Ext.dd.DropZone',

    getTargetFromEvent: function(e) {
        return e.getTarget("a.side.toggleComments", 10);
    },

    onNodeEnter: function(target, dd, e, data) {
        if (this.isValidDropTarget(data)) {
            Ext.fly(target).addCls('drop-target-hover');
        }
    },

    onNodeOut: function(target, dd, e, data) {
        Ext.fly(target).removeCls('drop-target-hover');
    },

    onNodeOver: function(target, dd, e, data) {
        if (this.isValidDropTarget(data)) {
            // Return the built-in dropAllowed CSS class.
            return this.dropAllowed;
        }
        else {
            return false;
        }
    },

    // only comments with a parent can be moved to the top level.
    // others are on the top level already
    isValidDropTarget: function(data) {
        return !!data.comment.get("parentId");
    },

    onNodeDrop: function(target, dd, e, data) {
        if (this.isValidDropTarget(data)) {
            this.onValidDrop(data.comment, undefined);
            return true;
        }
        return false;
    },

    /**
     * Called when comment was successfully dropped in the topmost
     * level target.
     * @template
     * @param {Docs.model.Comment} comment The comment that was dragged.
     * @param {Docs.model.Comment} parent Always undefined.
     * (This parameter is present to provide compatible API with the other
     * DropZone class).
     */
    onValidDrop: Ext.emptyFn
});
