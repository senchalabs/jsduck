/**
 * Controller for Examples showcase
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/example',
    title: 'Examples',

    orientation: 'landscape',
    device: 'ipad',

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
            'examplecontainer': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(e, el) {
                        this.changeDevice('ipad');
                    }, this, {
                        delegate: 'button.ipad'
                    });
                    cmp.el.addListener('click', function(e, el) {
                        this.changeDevice('iphone');
                    }, this, {
                        delegate: 'button.iphone'
                    });
                    cmp.el.addListener('click', function(e, el) {
                        this.changeDevice('nexus');
                    }, this, {
                        delegate: 'button.nexus'
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
                    this.map["#!/example/"+e.url] = e;
                }, this);
            }, this);
        }
        return this.map[url];
    },

    changeOrientation: function(orientation) {

        if (this.orientation === orientation) {
            return false;
        }
        this.orientation = orientation;

        var container = Ext.get(Ext.query('.touchExample')[0]),
            iframe = Ext.get(Ext.query('.touchExample iframe')[0]);

        Ext.Array.each(Ext.query('.example-toolbar .orientations button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .orientations button.' + this.orientation)).addCls('selected');

        container.removeCls(['portrait', 'landscape']);
        container.addCls(this.orientation);

        this.updateIframeDimensions(iframe);
    },

    changeDevice: function(device) {

        if (this.device === device) {
            return false;
        }
        this.device = device;

        var container = Ext.get(Ext.query('.touchExample')[0]),
            iframe = Ext.get(Ext.query('.touchExample iframe')[0]);

        Ext.Array.each(Ext.query('.example-toolbar .devices button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .devices button.' + this.device)).addCls('selected');

        container.removeCls(['iphone', 'ipad']);
        container.addCls(this.device);

        this.updateIframeDimensions(iframe);
    },

    updateIframeDimensions: function(iframe) {
        if (this.device == 'ipad') {
            iframe.setStyle({
                width: this.orientation == 'landscape' ? '1024px' : '768px',
                height: this.orientation == 'landscape' ? '768px' : '1024px',
            });
        } else {
            iframe.setStyle({
                width: this.orientation == 'landscape' ? '480px' : '320px',
                height: this.orientation == 'landscape' ? '320px' : '480px',
            });
        }
    }
});
