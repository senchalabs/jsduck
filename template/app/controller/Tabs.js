/**
 * Controller for tabs. Adds listeners for clicking tabs and their 'close' buttons
 */
Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'classTree',
            selector: 'classtree'
        },
        {
            ref: 'guideTree',
            selector: 'guidestree'
        },
        {
            ref: 'exampleTree',
            selector: 'examplestree'
        },
        {
            ref: 'videoTree',
            selector: 'videostree'
        }
    ],

    init: function() {
        this.getController('Classes').addListener({
            showClass: function(cls) {
                this.addTabFromTree("/api/"+cls, this.getClassTree());
            },
            scope: this
        });

        this.getController('Guides').addListener({
            showGuide: function(guide) {
                this.addTabFromTree("/guide/"+guide, this.getGuideTree());
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

                    // var prevTabs = Docs.Settings.get('openTabs');
                    // if (prevTabs) {
                    //     prevTabs.each(function(f) {
                    //         this.addTabFromTree(f, this.getClassTree(), true, true);
                    //     }, this);
                    // }
                },
                scope: this
            }
        });
    },

    /**
     * Adds a tab based on information from the class tree
     * @param {String} url The url of the record in the tree
     */
    addTabFromTree: function(url, tree, noAnimate, noActivate) {
        var treeRecord = tree.findRecordByUrl(url);
        if (treeRecord && treeRecord.raw) {
            Ext.getCmp('doctabs').addTab({
                href: '#' + treeRecord.raw.url,
                text: treeRecord.raw.text,
                iconCls: treeRecord.raw.iconCls
            }, noAnimate, noActivate);
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
            var docTab = Ext.get(el).up('.doctab');
            Ext.getCmp('doctabs').removeTab(docTab.down('.tabUrl').getAttribute('href'));
            docTab.animate({
                to: { top: 30 }
            }).animate({
                to: { width: 10 },
                listeners: {
                    afteranimate: function() {
                        docTab.remove();
                    },
                    scope: this
                }
            });
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
            Ext.getCmp('doctabs').activateTab(url);
        }, this, {
            delegate: '.doctab'
        });

        cmp.el.addListener('click', Ext.emptyFn, this, {
            delegate: '.tabUrl',
            preventDefault: true
        });
    }

});
