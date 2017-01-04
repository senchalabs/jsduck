/**
 * @private
 */
Ext.define('Ext.layout.component.field.FieldContainer', {

    /* Begin Definitions */

    extend: 'Ext.layout.component.field.Field',

    alias: 'layout.fieldcontainer',

    /* End Definitions */

    type: 'fieldcontainer',

    waitForOuterHeightInDom: true,
    waitForOuterWidthInDom: true,

    beginLayout: function(ownerContext) {
        this.callParent(arguments);

        // Tell Component.measureAutoDimensions to measure the DOM when containerChildrenDone is true
        ownerContext.hasRawContent = true;
        ownerContext.target.bodyEl.setStyle('height', '');
    },

    measureContentHeight: function (ownerContext) {
        // since we are measuring the outer el, we have to wait for whatever is in our
        // container to be flushed to the DOM... especially for things like box layouts
        // that size the innerCt since that is all that will contribute to our size!
        return ownerContext.hasDomProp('containerLayoutDone') ? this.callParent(arguments) : NaN;
    },

    measureContentWidth: function (ownerContext) {
        // see measureContentHeight
        return ownerContext.hasDomProp('containerLayoutDone') ? this.callParent(arguments) : NaN;
    },

    publishInnerWidth: function (ownerContext, width) {
        var bodyContext = ownerContext.bodyCellContext;
        bodyContext.setWidth(bodyContext.el.getWidth(), false);
    },
    
    publishInnerHeight: function (ownerContext, height) {
        var bodyContext = ownerContext.bodyCellContext;
        bodyContext.setHeight(height - this.measureLabelErrorHeight(ownerContext));
    }
});
