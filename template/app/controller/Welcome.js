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

    init: function() {
        this.addEvents('loadIndex');
    },

    loadIndex: function() {
        this.fireEvent('loadIndex');
        Ext.getCmp('treecontainer').hide();
        this.callParent([true]);
    },

    /**
     * True if welcome page is available.
     * @return {Boolean}
     */
    isActive: function() {
        return !!this.getIndex().getTab();
    }
});
