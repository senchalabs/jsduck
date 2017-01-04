/**
 * Component layout for grid column headers which have a title element at the top followed by content.
 * @private
 */
Ext.define('Ext.grid.ColumnComponentLayout', {
    extend: 'Ext.layout.component.Auto',
    alias: 'layout.columncomponent',

    type: 'columncomponent',

    setWidthInDom: true,

    getContentHeight : function(ownerContext) {
        // If we are a group header return container layout's contentHeight, else default to AutoComponent's answer
        return this.owner.isGroupHeader ? ownerContext.getProp('contentHeight') : this.callParent(arguments);
    },

    calculateOwnerHeightFromContentHeight: function (ownerContext, contentHeight) {
        var result = this.callParent(arguments);
        if (this.owner.isGroupHeader) {
            result += this.owner.titleEl.dom.offsetHeight;
        }
        return result;
    },
    
    getContentWidth : function(ownerContext) {
        // If we are a group header return container layout's contentHeight, else default to AutoComponent's answer
        return this.owner.isGroupHeader ? ownerContext.getProp('contentWidth') : this.callParent(arguments);
    },

    calculateOwnerWidthFromContentWidth: function (ownerContext, contentWidth) {
        return contentWidth + ownerContext.getPaddingInfo().width;
    }
});