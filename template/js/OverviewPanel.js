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

        var cfgTemplate = new Ext.XTemplate(
            '<div class="member f ni">',
                '<a href="Ext.Action.html#config-disabled" rel="config-disabled" class="expand more">',
                    '<span>&nbsp;</span>',
                '</a>',
                '<div class="title">',
                    '<div class="meta">',
                        '<a href="Ext.Action.html" class="definedIn docClass">{member}</a><br/>',
                        '<a href="../source/Action.html#Ext-Action-cfg-disabled" class="viewSource">view source</a>',
                    '</div>',
                    '<a name="disabled"></a>',
                    '<a name="config-disabled"></a>',
                    '<a href="Ext.Action.html#" rel="config-disabled" class="cls expand">{name}</a>',
                    '<span> : {type}</span>',
                '</div>',
                '<div class="description">',
                    '{doc}',
                '</div>',
            '</div>'
        );

        this.tpl = new Ext.XTemplate(
            '<div class="doc-overview-content">',
            '{doc}',
            '<div class="members">',
                '<div id="m-cfg">',
                    '<div class="definedBy">Defined By</div>',
                    '<h3 class="members-title">Config Options</h3>',
                    '<tpl for="cfg">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div id="m-property">',
                    '<div class="definedBy">Defined By</div>',
                    '<h3 class="members-title">Properties</h3>',
                    '<tpl for="property">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div id="m-method">',
                    '<div class="definedBy">Defined By</div>',
                    '<h3 class="members-title">Methods</h3>',
                    '<tpl for="method">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div id="m-event">',
                    '<div class="definedBy">Defined By</div>',
                    '<h3 class="members-title">Events</h3>',
                    '<tpl for="event">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
            '</div>',
            '</div>',
            {
                renderMember: function(cfg) {
                    return cfgTemplate.apply(cfg);
                }
            }
        );
    },

    load: function(docClass) {
      this.removeDocked(this.toolbar, true);
      this.toolbar = Ext.create('Docs.OverviewToolbar', {
        docClass: docClass
      });
      this.addDocked(this.toolbar);

      this.update(this.tpl.apply(docClass));
    }
});
