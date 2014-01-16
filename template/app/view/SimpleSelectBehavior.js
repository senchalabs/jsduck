/**
 * Helper to achieve the select/deselect behaviour that's more useful
 * for our purposes when dealing with simple selection model.
 *
 * In Ext.selection.Model when one item is already selected and you
 * select some other item, two events fire in row:
 *
 * - "deselect" of the previously selected item.
 * - "select" of the newly selected item.
 *
 * This wrapper class forwards those "select" and "deselect" events,
 * but the "deselect" is only forwarded in case all items become
 * deselected, not when the one just select another item.
 */
Ext.define('Docs.view.SimpleSelectBehavior', {
    mixins: {
        observable: "Ext.util.Observable"
    },

    /**
     * @event select
     * Fired when item gets selected.
     * @param {Object} item  Selected item.
     */
    /**
     * @event deselect
     * Fired when item gets deselected (and no other item gets selected).
     * @param {Object} item  Deselected item.
     */

    /**
     * Creates a wrapper around selection model.
     * @param {Ext.Component} selModel A component firering "select"
     * and "deselect" events.
     * @param {Object} listeners The listeners config for Observable.
     */
    constructor: function(cmp, listeners) {
        this.mixins.observable.constructor.call(this, {listeners: listeners});

        cmp.on({
            select: this.onSelect,
            deselect: this.onDeselect,
            scope: this
        });
    },

    onSelect: function(cmp, item) {
        this.selectedItem = item;
        this.fireEvent("select", item);
    },

    onDeselect: function(cmp, item) {
        this.selectedItem = undefined;
        Ext.Function.defer(function() {
            if (!this.selectedItem) {
                this.fireEvent("deselect", item);
            }
        }, 10, this);
    }

});
