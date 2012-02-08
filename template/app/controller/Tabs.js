/**
 * Controller for tabs. Adds listeners for clicking tabs and their 'close' buttons
 */
Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',
    requires: [
        'Docs.History',
        'Docs.Settings'
    ],

    refs: [
        {
            ref: 'welcomeIndex',
            selector: '#welcomeindex'
        },
        {
            ref: 'classIndex',
            selector: '#classindex'
        },
        {
            ref: 'guideIndex',
            selector: '#guideindex'
        },
        {
            ref: 'videoIndex',
            selector: '#videoindex'
        },
        {
            ref: 'exampleIndex',
            selector: '#exampleindex'
        },
        {
            ref: 'statsIndex',
            selector: '#statsindex'
        },
        {
            ref: 'commentIndex',
            selector: '#commentindex'
        },
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
                this.addTabFromTree("#!/video/"+video);
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
                            cmp.resizeTabs({animate: true});
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
                    Docs.History.push(cmp.href, { navigate: true });
                },
                scope: this
            }
        });
    },

    // Open all tabs from previous session
    onLaunch: function() {
        this.getDoctabs().setStaticTabs(Ext.Array.filter([
            this.getWelcomeIndex().getTab(),
            this.getClassIndex().getTab(),
            this.getGuideIndex().getTab(),
            this.getVideoIndex().getTab(),
            this.getExampleIndex().getTab(),
            this.getStatsIndex().getTab()
        ], function(x){return x;}));

        // just initialize the comments tab.
        // show/hide of it is performed separately.
        this.commentsTab = this.getCommentIndex().getTab();

        var tabs = Docs.Settings.get('tabs');
        if (tabs) {
            Ext.Array.forEach(tabs, function(url) {
                this.addTabFromTree(url, {animate: false});
            }, this);
        }
        Docs.History.notifyTabsLoaded();
    },

    /**
     * Makes comments tab visible.
     */
    showCommentsTab: function() {
        var tabs = this.getDoctabs().getStaticTabs();
        this.getDoctabs().setStaticTabs(tabs.concat(this.commentsTab));
    },

    /**
     * Hides comments tab.
     */
    hideCommentsTab: function() {
        var tabs = this.getDoctabs().getStaticTabs();
        this.getDoctabs().setStaticTabs(Ext.Array.remove(tabs, this.commentsTab));
    },

    /**
     * Adds a tab based on information from the class tree
     * @param {String} url The url of the record in the tree
     * @param {Object} [opts={animate: true, activate: true}] Specify to override defaults.
     * @private
     */
    addTabFromTree: function(url, opts) {
        var tree = this.getTree(url);
        var treeRecord = tree.findRecordByUrl(url);
        if (treeRecord) {
            this.addTab(treeRecord, opts);
        }
    },

    // Adds new tab, no questions asked
    addTab: function(tab, opts) {
        opts = opts || { animate: true, activate: true };
        // Init scrollstate when tab opened.
        if (!this.scrollState[tab.url]) {
            this.scrollState[tab.url] = 0;
        }
        this.getDoctabs().addTab({
            href: tab.url,
            text: tab.text,
            iconCls: tab.iconCls
        }, opts);
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
            Docs.History.push(url, { navigate: true });
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
    }

});
