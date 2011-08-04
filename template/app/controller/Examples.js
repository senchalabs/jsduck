/**
 * Controller for Examples showcase
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'tree',
            selector: 'examplestree'
        }
    ],

    init: function() {
        this.addEvents(
            /**
             * @event showExample
             * Fired after an example is shown. Used for analytics event tracking.
             * @param {String} example name of the example.
             */
            "showExample"
        );

        this.control({
            'examplestree': {
                exampleclick: function(url, event) {
                    this.loadExample(url);
                }
            },
            'examplesindex > thumblist': {
                urlclick: function(url) {
                    this.loadExample(url);
                }
            }
        });
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/examples');
        Ext.getCmp('card-panel').layout.setActiveItem('examples');
        Ext.getCmp('tree-container').layout.setActiveItem(1);
        Ext.getCmp('tree-container').show();
    },

    loadExample: function(url, noHistory) {
        if (this.activeUrl === url) {
            return this.activateExampleCard();
        }
        this.activeUrl = url;

        noHistory || Docs.History.push(url);

        this.fireEvent('showExample', url);

        var ifr = document.getElementById("exampleIframe");
        ifr.contentWindow.location.replace('extjs/' + url);
        setTimeout(this.activateExampleCard, 150); // Prevent previous example from flashing up
    },

    activateExampleCard: function() {
        Ext.getCmp('card-panel').layout.setActiveItem('example');
        Ext.getCmp('tree-container').layout.setActiveItem(1);
    }
});
