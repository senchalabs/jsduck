/**
 * Provides a handle for 9-point resizing of Elements or Components.
 */
Ext.define('Ext.resizer.Handle', {
    extend: 'Ext.Component',
    handleCls: '',
    baseHandleCls: Ext.baseCSSPrefix + 'resizable-handle',
    // Ext.resizer.Resizer.prototype.possiblePositions define the regions
    // which will be passed in as a region configuration.
    region: '',

    beforeRender: function() {
        var me = this;

        me.callParent();

        me.addCls(
            me.baseHandleCls,
            me.baseHandleCls + '-' + me.region,
            me.handleCls
        );
    },

    onRender: function() {
        this.callParent(arguments);

        this.el.unselectable();
    }
});
