/**
 * Controller for DocTest page.
 */
Ext.define('Docs.controller.DocTests', {
    extend: 'Docs.controller.Content',
    baseUrl: "#!/doctests",

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#doctestsindex'
        }
    ],

    init: function() {
        this.addEvents('loadIndex');

        this.control({
            '#doctestsgrid': {
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
     * True if DocTests page is available.
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
