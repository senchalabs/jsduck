Ext.define('Docs.OverviewPanel', {
    extend: 'Ext.panel.Panel',

    id: 'doc-overview',
    cls: 'doc-tab iScroll',
    title: 'Overview',
    autoScroll: true,

    /**
     * @cfg {Object} docClass
     * Documentation for a class.
     */
    docClass: {},

    scrollToEl: function(query) {
        var el = Ext.get(Ext.query(query)[0]);
        if (el) {
            var scrollOffset = el.getY() - 150;
            var docContent = Ext.get(Ext.query('#doc-overview .x-panel-body')[0]);
            var currentScroll = docContent.getScroll()['top'];
            docContent.scrollTo('top', currentScroll + scrollOffset, true);

            var prnt = el.up('.member');
            if (prnt) {
                Ext.get(prnt).addCls('open');
            }
        }
    },

    listeners: {
        afterrender: function(cmp) {
            cmp.el.addListener('click', function(cmp, el) {
                Ext.get(Ext.get(el).up('.member')).toggleCls('open');
            }, this, {
                preventDefault: true,
                delegate: '.expand'
            });
            cmp.el.addListener('click', function(cmp, el) {
                getDocClass(el.rel);
            }, this, {
                preventDefault: true,
                delegate: '.docClass'
            });
            prettyPrint();
        }
    },

    initComponent: function() {
        this.dockedItems = [
            this.toolbar = Ext.create('Docs.OverviewToolbar', {
              docClass: this.docClass
            })
        ];

        if (Ext.get('doc-overview-content')) {
            this.contentEl = 'doc-overview-content';
        }

        this.callParent(arguments);
    },

    load: function(docClass) {
      this.removeDocked(this.toolbar, true);
      this.toolbar = Ext.create('Docs.OverviewToolbar', {
        docClass: docClass
      });
      this.addDocked(this.toolbar);

      this.update(docClass.doc);
    }
});
