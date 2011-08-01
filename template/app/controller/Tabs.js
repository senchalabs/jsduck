/**
 * Controller for tabs. Adds listeners for clicking tabs and their 'close' buttons
 */
Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'tree',
            selector: 'classtree'
        }
    ],

    init: function() {

        this.getController('Classes').addListener({
            showClass: function(cls) {
                this.addTabFromTree("/api/"+cls);
            },
            showGuide: function(guide) {
                this.addTabFromTree("/guide/"+guide);
            },
            scope: this
        });

        this.control({
            'container [componentCls=doctabs]': {
                afterrender: function(cmp) {
                    this.addTabIconListeners(cmp);
                    this.addTabListeners(cmp);
                }
            }
        });
    },

    /**
     * Adds a tab based on information from the class tree
     * @param {String} url The url of the record in the tree
     */
    addTabFromTree: function(url) {
        var treeRecord = this.getTree().findRecordByUrl(url);
        Ext.getCmp('doctabs').addTab({
            href: '#' + treeRecord.raw.url,
            text: treeRecord.raw.text,
            iconCls: treeRecord.raw.iconCls
        })
    },

    /**
     * Adds mouse interaction listeners to the tab icon
     * @private
     */
    addTabIconListeners: function(cmp) {

        cmp.el.addListener('mouseover', function(event, el) {
            Ext.get(el).addCls('ovr');
        }, this, {
            delegate: '.icn'
        });

        cmp.el.addListener('mouseout', function(event, el) {
            Ext.get(el).removeCls('ovr');
        }, this, {
            delegate: '.icn'
        });

        cmp.el.addListener('click', function(event, el) {
            cmp.justClosed = true;
            var docTab = Ext.get(el).up('.doctab');
            Ext.getCmp('doctabs').removeTab(docTab.down('.docClass').getAttribute('href'));
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
            delegate: '.icn',
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
            Ext.Array.each(Ext.get(el).up('.doctabs').query('.doctab'), function(t) {
                Ext.get(t).removeCls('active');
            });
            Ext.get(el).addCls('active');
            window.location = Ext.get(el).down('.tabUrl').getAttribute('href');
        }, this, {
            delegate: '.doctab'
        });

        cmp.el.addListener('click', Ext.emptyFn, this, {
            delegate: '.tabUrl',
            preventDefault: true
        });

        cmp.el.addListener('mouseover', function(event, el) {
            var icn = Ext.get(el).down('.icn');
            if (icn) {
                icn.addCls('close');
            }
        }, this, {
            delegate: '.doctab'
        });

        cmp.el.addListener('mouseout', function(event, el) {
            var icn = Ext.get(el).down('.icn');
            if (icn) {
                icn.removeCls('close');
            }
        }, this, {
            delegate: '.doctab'
        });
    }

});
