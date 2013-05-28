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
        },
        {
            ref: 'page',
            selector: '#example'
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
            },
            'touchexamplecontainer, examplecontainer': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(e, el) {
                        this.openInNewWindow();
                    }, this, {
                        delegate: 'button.new-window'
                    });
                }
            },
            'touchexamplecontainer': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(e, el) {
                        this.changeDevice('tablet');
                    }, this, {
                        delegate: 'button.tablet'
                    });
                    cmp.el.addListener('click', function(e, el) {
                        this.changeDevice('phone');
                    }, this, {
                        delegate: 'button.phone'
                    });
                    cmp.el.addListener('click', function(e, el) {
                        this.changeOrientation('portrait');
                    }, this, {
                        delegate: 'button.portrait'
                    });
                    cmp.el.addListener('click', function(e, el) {
                        this.changeOrientation('landscape');
                    }, this, {
                        delegate: 'button.landscape'
                    });
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
        if (!example) {
            this.getController('Failure').show404("Example <b>"+Ext.String.htmlEncode(url)+"</b> was not found.");
            return;
        }
        this.getViewport().setPageTitle(example.text);
        if (this.activeUrl !== url) {
            this.getPage().clear();
            this.activateExampleCard();
            this.getPage().load(example);
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
                    this.map["#!/example/"+e.name] = e;
                }, this);
            }, this);
        }
        return this.map[url];
    },

    changeOrientation: function(orientation) {
        this.getPage().setOrientation(orientation);
    },

    changeDevice: function(device) {
        this.getPage().setDevice(device);
    },

    openInNewWindow: function() {
        window.open(this.getExample(this.activeUrl).url);
    }
});
