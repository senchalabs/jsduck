/**
 * Controller for tabs. Adds listeners for clicking tabs and their 'close' buttons
 */
Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',

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
                this.addTabFromTree("#!/api/"+cls, this.getClassTree());
            },
            scope: this
        });

        this.getController('Guides').addListener({
            showGuide: function(guide) {
                this.addTabFromTree("#!/guide/"+guide, this.getGuideTree());
            },
            scope: this
        });

        this.getController('Examples').addListener({
            showExample: function(example) {
                this.addTabFromTree(example, this.getExampleTree());
            },
            scope: this
        });

        this.getController('Videos').addListener({
            showVideo: function(video) {
                this.addTabFromTree(video, this.getVideoTree());
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
                    })
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

    /**
     * Adds a tab based on information from the class tree
     * @param {String} url The url of the record in the tree
     */
    addTabFromTree: function(url, tree) {
        var treeRecord = tree.findRecordByUrl(url);
        if (treeRecord && treeRecord.raw) {
            this.getDoctabs().addTab({
                href: treeRecord.raw.url,
                text: treeRecord.raw.text,
                iconCls: treeRecord.raw.iconCls
            }, { animate: true, activate: true });
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
    }

});
