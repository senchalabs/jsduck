/**
 * Supporting Class for Ext.Direct (not intended to be used directly).
 */
Ext.define('Ext.direct.Transaction', {
    
    /* Begin Definitions */
   
    alias: 'direct.transaction',
    alternateClassName: 'Ext.Direct.Transaction',
   
    statics: {
        TRANSACTION_ID: 0
    },
   
    /* End Definitions */

    /**
     * Creates new Transaction.
     * @param {Object} [config] Config object.
     */
    constructor: function(config){
        var me = this;
        
        Ext.apply(me, config);
        me.id = me.tid = ++me.self.TRANSACTION_ID;
        me.retryCount = 0;
    },
   
    send: function(){
         this.provider.queueTransaction(this);
    },

    retry: function(){
        this.retryCount++;
        this.send();
    },

    getProvider: function(){
        return this.provider;
    }
});
