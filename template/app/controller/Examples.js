/**
 * Controller for Examples showcase
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/example',
    title: 'Examples',

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#exampleindex'
        },
        {
            ref: 'tree',
            selector: '#exampletree'
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
            '#exampletree': {
                urlclick: function(url, event) {
                    this.loadExample(url);
                }
            },
            'exampleindex > thumblist': {
                urlclick: function(url) {
                    this.loadExample(url);
                }
            }
        });
    },

    loadIndex: function() {
        Ext.getCmp('treecontainer').showTree('exampletree');
        this.callParent();
    },

    loadExample: function(url, noHistory) {
        var example = this.getExample(url);
        this.getViewport().setPageTitle(example.text);
        if (this.activeUrl !== url) {
            this.activateExampleCard();
            var ifr = document.getElementById("exampleIframe");
            ifr.contentWindow.location.replace('extjs/examples/' + example.url);
        }
        else {
            this.activateExampleCard();
        }
        noHistory || Docs.History.push(url);
        this.fireEvent('showExample', url);
        this.getTree().selectUrl(url);
        this.activeUrl = url;
    },

    activateExampleCard: function() {
        Ext.getCmp('card-panel').layout.setActiveItem('example');
        Ext.getCmp('treecontainer').showTree('exampletree');
    },

    // Given an URL returns corresponding example description object
    getExample: function(url) {
        if (!this.map) {
            this.map = {};
            Ext.Array.forEach(Docs.data.examples, function(group) {
                Ext.Array.forEach(group.items, function(e) {
                    this.map["#!/example/"+e.url] = e;
                }, this);
            }, this);
        }
        return this.map[url];
    }
});
