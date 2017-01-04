/**
 * Adds custom behavior for left/right keyboard navigation for use with a tree.
 * Depends on the view having an expand and collapse method which accepts a
 * record.
 * 
 * @private
 */
Ext.define('Ext.selection.TreeModel', {
    extend: 'Ext.selection.RowModel',
    alias: 'selection.treemodel',
    
    // typically selection models prune records from the selection
    // model when they are removed, because the TreeView constantly
    // adds/removes records as they are expanded/collapsed
    pruneRemoved: false,
    
    onKeyRight: function(e, t) {
        var focused = this.getLastFocused(),
            view    = this.view;
            
        if (focused) {
            // tree node is already expanded, go down instead
            // this handles both the case where we navigate to firstChild and if
            // there are no children to the nextSibling
            if (focused.isExpanded()) {
                this.onKeyDown(e, t);
            // if its not a leaf node, expand it
            } else if (focused.isExpandable()) {
                view.expand(focused);
            }
        }
    },
    
    onKeyLeft: function(e, t) {
        var focused = this.getLastFocused(),
            view    = this.view,
            viewSm  = view.getSelectionModel(),
            parentNode, parentRecord;

        if (focused) {
            parentNode = focused.parentNode;
            // if focused node is already expanded, collapse it
            if (focused.isExpanded()) {
                view.collapse(focused);
            // has a parentNode and its not root
            // TODO: this needs to cover the case where the root isVisible
            } else if (parentNode && !parentNode.isRoot()) {
                // Select a range of records when doing multiple selection.
                if (e.shiftKey) {
                    viewSm.selectRange(parentNode, focused, e.ctrlKey, 'up');
                    viewSm.setLastFocused(parentNode);
                // just move focus, not selection
                } else if (e.ctrlKey) {
                    viewSm.setLastFocused(parentNode);
                // select it
                } else {
                    viewSm.select(parentNode);
                }
            }
        }
    },
    
    onKeySpace: function(e, t) {
        this.toggleCheck(e);
    },
    
    onKeyEnter: function(e, t) {
        this.toggleCheck(e);
    },
    
    toggleCheck: function(e){
        e.stopEvent();
        var selected = this.getLastSelected();
        if (selected) {
            this.view.onCheckChange(selected);
        }
    }
});
