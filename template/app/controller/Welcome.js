/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Welcome', {
    extend: 'Docs.controller.Content',
    baseUrl: "#",

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#welcomeindex'
        }
    ],

    loadIndex: function() {
        Ext.getCmp('treecontainer').hide();
        this.callParent([true]);
    },

    /**
     * Displays page with 404 error message.
     * @param {String} msg
     * @private
     */
    showFailure: function(msg) {
        var tpl = new Ext.XTemplate(
            "<h1>Oops...</h1>",
            "<p>{msg}</p>",
            "<p>Maybe it was renamed to something else? Or maybe it has passed away permanently to the 404 land? ",
            "This would be sad. Hopefully it's just a bug in our side. ",
            "Report it to <a href='http://www.sencha.com/forum/showthread.php?135036'>Sencha Forum</a> if you feel so.</p>",
            "<p>Sorry for all this :(</p>"
        );
        Ext.getCmp("failure").update(tpl.apply({msg: msg}));
        Ext.getCmp('card-panel').layout.setActiveItem("failure");
    },

    /**
     * True if welcome page is available.
     * @return {Boolean}
     */
    isActive: function() {
        return !!this.getIndex().getTab();
    }
});
