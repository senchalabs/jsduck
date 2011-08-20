/**
 * Controller for tabs. Adds listeners for clicking tabs and their 'close' buttons
 */
Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',
    requires: ['Docs.Settings'],

    refs: [
        {
            ref: 'classTree',
            selector: '#classtree'
        },
        {
            ref: 'guideTree',
            selector: '#guidetree'
        },
        {
            ref: 'exampleTree',
            selector: '#exampletree'
        },
        {
            ref: 'videoTree',
            selector: '#videotree'
        },
        {
            ref: 'doctabs',
            selector: '#doctabs'
        }
    ],

    scrollState: {},

    init: function() {
        this.getController('Classes').addListener({
            showClass: function(cls) {
                this.addTabFromTree("#!/api/"+cls);
            },
            scope: this
        });

        this.getController('Guides').addListener({
            showGuide: function(guide) {
                this.addTabFromTree("#!/guide/"+guide);
            },
            scope: this
        });

        this.getController('Examples').addListener({
            showExample: function(example) {
                this.addTabFromTree(example);
            },
            scope: this
        });

        this.getController('Videos').addListener({
            showVideo: function(video) {
                this.addTabFromTree(video);
            },
            scope: this
        });

        this.control({
            'container [componentCls=doctabs]': {
                afterrender: function(cmp) {
                    this.addTabIconListeners(cmp);
                    this.addTabListeners(cmp);

                    cmp.el.on('mouseleave', function() {
                        if (cmp.shouldResize) {
                            cmp.resizeTabs();
                        }
                    });
                },
                resize: function() {
                    Ext.getCmp('doctabs').refresh();
                },
                scope: this
            },
            '#tabOverflowMenu menuitem': {
                click: function(cmp) {
                    Docs.History.push(cmp.href);
                },
                scope: this
            }
        });
    },

    // Open all tabs from previous session
    onLaunch: function() {
        var tabs = Docs.Settings.get('tabs');
        if (tabs) {
            Ext.Array.forEach(tabs, this.addTabFromTree, this);
        }
    },

    /**
     * Adds a tab based on information from the class tree
     * @param {String} url The url of the record in the tree
     * @private
     */
    addTabFromTree: function(url) {
        var tree = this.getTree(url);
        var treeRecord = tree.findRecordByUrl(url);
        if (treeRecord && treeRecord.raw) {
            // Init scrollstate when tab opened.
            if (!this.scrollState[url]) {
                this.scrollState[url] = 0;
            }
            this.saveTabs();
            this.getDoctabs().addTab({
                href: treeRecord.raw.url,
                text: treeRecord.raw.text,
                iconCls: treeRecord.raw.iconCls
            }, { animate: true, activate: true });
        }
    },

    // Determines tree from an URL
    getTree: function(url) {
        if (/#!?\/api/.test(url)) {
            return this.getClassTree();
        }
        else if (/#!?\/guide/.test(url)) {
            return this.getGuideTree();
        }
        else if (/#!?\/video/.test(url)) {
            return this.getVideoTree();
        }
        else if (/#!?\/example/.test(url)) {
            return this.getExampleTree();
        }
        else {
            // default to classtree, just in case
            return this.getClassTree();
        }
    },

    /**
     * Adds mouse interaction listeners to the tab icon
     * @private
     */
    addTabIconListeners: function(cmp) {
        cmp.el.addListener('mouseover', function(event, el) {
            Ext.get(el).addCls('ovr');
        }, this, {
            delegate: '.close'
        });

        cmp.el.addListener('mouseout', function(event, el) {
            Ext.get(el).removeCls('ovr');
        }, this, {
            delegate: '.close'
        });

        cmp.el.addListener('click', function(event, el) {
            cmp.justClosed = true;
            var url = Ext.get(el).up('.doctab').down('.tabUrl').getAttribute('href');
            url = Docs.History.cleanUrl(url);
            delete this.scrollState[url];
            this.saveTabs();
            Ext.getCmp('doctabs').removeTab(url);
        }, this, {
            delegate: '.close',
            preventDefault: true
        });
    },

    /**
     * Adds mouse interaction listeners to the tab
     * @private
     */
    addTabListeners: function(cmp) {
        cmp.el.addListener('click', function(event, el) {
            if (cmp.justClosed) {
                cmp.justClosed = false;
                return;
            }
            var url = Ext.get(el).down('.tabUrl').getAttribute('href');
            Docs.History.push(url);
        }, this, {
            delegate: '.doctab'
        });

        cmp.el.addListener('click', Ext.emptyFn, this, {
            delegate: '.tabUrl',
            preventDefault: true
        });
    },

    /**
     * Saves scrollstate of a tab.
     *
     * @param {String} url  URL of the tab.
     * @param {Number} scroll  the scroll amount.
     */
    setScrollState: function(url, scroll) {
        this.scrollState[url] = scroll;
    },

    /**
     * Returns scrollstate of a tab.
     *
     * @param {String} url  URL of the tab.
     * @return {Number} the scroll amount.
     */
    getScrollState: function(url) {
        return this.scrollState[url] || 0;
    },

    // Use the scrollState cache as a source for open tabs.
    // Filter out the always-open tabs and save the others.
    saveTabs: function() {
        var urls = Ext.Object.getKeys(this.scrollState);
        Docs.Settings.set('tabs', Ext.Array.filter(urls, function(url) {
            return /#!\/[a-z]+\/./.test(url);
        }));
    }

});
