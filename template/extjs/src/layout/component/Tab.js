/**
 * Component layout for tabs
 * @private
 */
Ext.define('Ext.layout.component.Tab', {

    extend: 'Ext.layout.component.Button',
    alias: 'layout.tab',

    beginLayout: function(ownerContext) {
        var me = this,
            closable = me.owner.closable;

        // Changing the close button visibility causes our cached measurements to be wrong,
        // so we must convince our base class to re-cache those adjustments...
        if (me.lastClosable !== closable) {
            me.lastClosable = closable;
            me.clearTargetCache();
        }

        me.callParent(arguments);
    }
});
