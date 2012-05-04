/**
 * Controller for Inline Examples test page.
 */
Ext.define('Docs.controller.Tests', {
    extend: 'Docs.controller.Content',
    baseUrl: "#!/tests",

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#testsindex'
        }
    ],

    init: function() {
        this.addEvents('loadIndex');

        this.control({
            '#testsgrid': {
                afterrender: this.loadExamples
            }
        });
    },

    loadIndex: function() {
        this.fireEvent('loadIndex');
        Ext.getCmp('treecontainer').hide();
        this.callParent([true]);
    },

    /**
     * True if Tests page is available.
     * @return {Boolean}
     */
    isActive: function() {
        return !!this.getIndex().getTab();
    },

    /**
     * Loads all examples from .js file.
     * @private
     */
    loadExamples: function() {
        this.getIndex().disable();

        Ext.data.JsonP.request({
            url: this.getBaseUrl() + "/inline-examples.js",
            callbackName: "__inline_examples__",
            success: function(examples) {
                this.getIndex().addExamples(examples);
                this.getIndex().enable();
            },
            scope: this
        });
    }

});
